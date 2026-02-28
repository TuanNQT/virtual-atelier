// dotenv phải được config TRƯỚC KHI bất kỳ module nào đọc process.env
// Giải pháp: dùng dynamic import cho googleSheets bên trong startServer()
import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import ImageKit from "@imagekit/nodejs";
import { GEMINI_MODEL } from "./src/constants/config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Session Store ────────────────────────────────────────────────────────────
interface Session {
  email: string;
  expiresAt: number;
}
const sessions = new Map<string, Session>();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 giờ

function createSession(email: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { email, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function getSession(token: string): Session | null {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

setInterval(
  () => {
    const now = Date.now();
    sessions.forEach((s, token) => {
      if (now > s.expiresAt) sessions.delete(token);
    });
  },
  30 * 60 * 1000,
);

// ─── Middleware ───────────────────────────────────────────────────────────────
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Chưa đăng nhập" });
  const session = getSession(token);
  if (!session)
    return res
      .status(401)
      .json({ error: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại" });
  (req as any).session = session;
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    const session = (req as any).session as Session;
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;
    if (
      !initialEmail ||
      session.email.toLowerCase() !== initialEmail.toLowerCase()
    ) {
      return res.status(403).json({ error: "Không có quyền admin" });
    }
    next();
  });
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(windowMs: number, max: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const record = rateLimitMap.get(key);
    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (record.count >= max) {
      return res
        .status(429)
        .json({ error: "Quá nhiều yêu cầu, vui lòng thử lại sau." });
    }
    record.count++;
    next();
  };
}

// ─── Input validation ─────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase().slice(0, 254);
  if (!EMAIL_REGEX.test(trimmed)) return null;
  return trimmed;
}

// ─── Server ───────────────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  // ✅ Dynamic import — googleSheets.ts sẽ đọc process.env SAU KHI dotenv.config() đã chạy
  const {
    initializeSheet,
    getUserByEmail,
    addUser,
    updateRequestCount,
    getAllUsers,
    deleteUser,
    seedInitialUser,
    initializeHistorySheet,
    saveHistorySession,
    getHistorySessions,
    clearUserHistory,
  } = await import("./lib/googleSheets.js");

  // Google Sheets init
  try {
    await initializeSheet();
    await initializeHistorySheet();
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;
    if (initialEmail) await seedInitialUser(initialEmail);
  } catch (error) {
    console.error("Failed to initialize Google Sheets:", error);
    process.exit(1);
  }

  app.use(express.json({ limit: "15mb" }));

  // ── Auth ──────────────────────────────────────────────────────────────────
  app.post("/api/auth/verify", rateLimit(60_000, 10), async (req, res) => {
    const email = validateEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: "Email không hợp lệ" });
    try {
      const user = await getUserByEmail(email);
      if (!user)
        return res
          .status(403)
          .json({ error: "Email không có quyền truy cập!" });
      const token = createSession(user.email);
      res.json({
        success: true,
        token,
        email: user.email,
        requestCount: user.request_count,
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi xác thực" });
    }
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const session = (req as any).session as Session;
    res.json({ email: session.email });
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) sessions.delete(token);
    res.json({ success: true });
  });

  // ── Usage ─────────────────────────────────────────────────────────────────
  app.post("/api/usage/increment", requireAuth, async (req, res) => {
    const session = (req as any).session as Session;
    try {
      const newCount = await updateRequestCount(session.email);
      res.json({ success: true, newCount });
    } catch (error) {
      console.error("Increment error:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật lượt dùng" });
    }
  });

  // ── Generate ──────────────────────────────────────────────────────────────
  app.post(
    "/api/generate",
    requireAuth,
    rateLimit(60_000, 6),
    async (req, res) => {
      const {
        productImageBase64,
        modelImageBase64,
        gender,
        themeLabel,
        selectedAspectRatio,
        description,
        variationIndex,
        posePrompt,
      } = req.body;

      if (!productImageBase64)
        return res.status(400).json({ error: "Thiếu ảnh sản phẩm" });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey)
        return res
          .status(500)
          .json({ error: "Server chưa cấu hình GEMINI_API_KEY" });

      try {
        const ai = new GoogleGenAI({ apiKey });
        const basePrompt = `A high-quality, professional fashion photograph of a ${
          gender === "female" ? "female" : "male"
        } Vietnamese model, approximately 20 years old, looking young and energetic.
The model is ${posePrompt || "holding an iPhone taking a selfie in front of a mirror"}.
The model is wearing the exact clothing shown in the provided product image.
${
  gender === "female"
    ? "The model has long flowing hair, a beautiful tall physique with balanced curves."
    : "The model has a stylish side part hairstyle, a fit tall physique with 6-pack abs and broad shoulders."
}
The setting is a ${themeLabel || "modern"} environment.
${description ? `Additional context: ${description}` : ""}
The output must be a realistic, high-resolution image with a ${selectedAspectRatio || "9:16"} aspect ratio. (Variation ${(variationIndex || 0) + 1})`;

        const parts: any[] = [
          { inlineData: { data: productImageBase64, mimeType: "image/png" } },
        ];
        if (modelImageBase64)
          parts.push({
            inlineData: { data: modelImageBase64, mimeType: "image/png" },
          });
        parts.push({ text: basePrompt });

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: { parts },
          config: {
            imageConfig: { aspectRatio: selectedAspectRatio || "9:16" },
          } as any,
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inlineData,
        );
        if (!imagePart?.inlineData)
          return res.status(500).json({ error: "Không tạo được ảnh" });

        res.json({ success: true, imageBase64: imagePart.inlineData.data });
      } catch (error: any) {
        console.error("Generation error:", error);
        if (error.status === 429 || error.message?.includes("429")) {
          return res.status(429).json({ error: "QUOTA_EXHAUSTED" });
        }
        res.status(500).json({ error: "Lỗi khi tạo ảnh" });
      }
    },
  );

  // ── ImageKit Upload (cho history — lưu URL thay base64) ───────────────────
  // urlEndpoint: public (https://ik.imagekit.io/virtualatelier)
  // privateKey: CHỈ server, KHÔNG BAO GIỜ gửi về client
  const IMAGEKIT_URL_ENDPOINT =
    process.env.IMAGEKIT_URL_ENDPOINT ||
    "https://ik.imagekit.io/virtualatelier";

  app.post(
    "/api/upload-to-imagekit",
    requireAuth,
    rateLimit(60_000, 20),
    async (req, res) => {
      const {
        images,
        productImage,
        modelImage,
      }: {
        images?: Array<{ base64: string; filename: string }>;
        productImage?: string;
        modelImage?: string;
      } = req.body;
      if (!Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ error: "Thiếu danh sách ảnh" });
      }

      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
      const urlEndpoint =
        process.env.IMAGEKIT_URL_ENDPOINT ||
        "https://ik.imagekit.io/virtualatelier";

      if (!privateKey) {
        return res
          .status(500)
          .json({ error: "Server chưa cấu hình IMAGEKIT_PRIVATE_KEY" });
      }

      const client = new ImageKit({ privateKey });
      const folder = `va/${new Date().toISOString().slice(0, 10)}`;
      const cleanEndpoint = urlEndpoint.replace(/\/$/, "");

      const uploadOne = async (
        base64: string,
        filename: string,
      ): Promise<string | null> => {
        try {
          if (!base64) return null;

          const dataUri = base64.startsWith("data:")
            ? base64
            : `data:image/png;base64,${base64}`;

          const resp = await client.files.upload({
            file: dataUri,
            fileName: filename,
            folder,
            useUniqueFileName: true,
          });

          return (
            resp?.url ||
            (resp?.filePath
              ? `${cleanEndpoint}/${resp.filePath.replace(/^\//, "")}`
              : null)
          );
        } catch (err) {
          console.error("Upload single file error:", err);
          return null; // không crash toàn bộ request
        }
      };

      try {
        // 1️⃣ Upload results song song
        const resultUploads = await Promise.all(
          images.map(({ base64, filename }) => uploadOne(base64, filename)),
        );

        const urls = resultUploads.filter(
          (u): u is string => typeof u === "string",
        );

        if (urls.length !== images.length) {
          return res.status(500).json({
            error: "Một số ảnh result upload thất bại",
          });
        }

        return res.json({
          success: true,
          urls,
        });
      } catch (err) {
        console.error("ImageKit upload fatal error:", err);
        return res.status(500).json({
          error: "Lỗi khi upload lên ImageKit",
        });
      }
    },
  );

  // ── Admin ─────────────────────────────────────────────────────────────────
  app.get("/api/admin/check", requireAuth, (req, res) => {
    const session = (req as any).session as Session;
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;
    res.json({
      isAdmin:
        !!initialEmail &&
        session.email.toLowerCase() === initialEmail.toLowerCase(),
    });
  });

  app.get("/api/admin/list-users", requireAdmin, async (_req, res) => {
    try {
      res.json({ users: await getAllUsers() });
    } catch {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/add-user", requireAdmin, async (req, res) => {
    const email = validateEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: "Email không hợp lệ" });
    try {
      await addUser(email);
      res.json({ success: true, message: `User ${email} added successfully` });
    } catch {
      res.status(500).json({ error: "Failed to add user" });
    }
  });

  app.post("/api/admin/delete-user", requireAdmin, async (req, res) => {
    const email = validateEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: "Email không hợp lệ" });
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;
    if (initialEmail && email === initialEmail.toLowerCase()) {
      return res
        .status(400)
        .json({ error: "Không thể xóa tài khoản admin gốc" });
    }
    try {
      await deleteUser(email);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // ── History (Google Sheets) ───────────────────────────────────────────────
  app.get("/api/history", requireAuth, async (req, res) => {
    const email = ((req as any).session as Session).email;
    try {
      const sessions = await getHistorySessions(email);
      res.json({ sessions });
    } catch (err) {
      console.error("[history GET]", err);
      res.status(500).json({ error: "Không thể lấy lịch sử" });
    }
  });

  app.post("/api/history", requireAuth, async (req, res) => {
    const email = ((req as any).session as Session).email;
    const {
      session_id,
      timestamp,
      theme,
      gender,
      aspectRatio,
      productImageUrl,
      modelImageUrl,
      results,
    } = req.body;
    if (!session_id || !results)
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    try {
      await saveHistorySession({
        session_id,
        email,
        timestamp,
        theme,
        gender,
        aspectRatio,
        productImageUrl,
        modelImageUrl,
        results,
      });
      res.json({ success: true });
    } catch (err) {
      console.error("[history POST]", err);
      res.status(500).json({ error: "Không thể lưu lịch sử" });
    }
  });

  app.delete("/api/history", requireAuth, async (req, res) => {
    const email = ((req as any).session as Session).email;
    try {
      await clearUserHistory(email);
      res.json({ success: true });
    } catch (err) {
      console.error("[history DELETE]", err);
      res.status(500).json({ error: "Không thể xóa lịch sử" });
    }
  });

  // ── Vite / static ─────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (_req, res) =>
      res.sendFile(path.resolve(__dirname, "dist/index.html")),
    );
  }

  app.listen(PORT, "0.0.0.0", () =>
    console.log(`Server running on http://localhost:${PORT}`),
  );
}

startServer();
