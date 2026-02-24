import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  initializeSheet,
  getUserByEmail,
  addUser,
  updateRequestCount,
  getAllUsers,
  deleteUser,
  seedInitialUser,
} from "./lib/googleSheets.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Google Sheets
  try {
    await initializeSheet();
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;
    if (initialEmail) {
      await seedInitialUser(initialEmail);
    }
  } catch (error) {
    console.error("Failed to initialize Google Sheets:", error);
    process.exit(1);
  }

  app.use(express.json());

  // API Routes
  app.post("/api/auth/verify", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const user = await getUserByEmail(email);

      if (!user) {
        return res.status(403).json({ error: "Email không có quyền truy cập!" });
      }

      res.json({
        success: true,
        email: user.email,
        requestCount: user.request_count,
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi xác thực" });
    }
  });

  app.post("/api/usage/increment", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const user = await getUserByEmail(email);

      if (!user) {
        return res.status(403).json({ error: "Email không tồn tại trong hệ thống" });
      }

      const newCount = await updateRequestCount(email);
      res.json({ success: true, newCount });
    } catch (error: any) {
      console.error("Increment error:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật lượt dùng" });
    }
  });

  // Admin route to check if user is admin
  app.post("/api/admin/check", (req, res) => {
    const { email } = req.body;
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;
    const isAdmin = email && initialEmail && email.toLowerCase() === initialEmail.toLowerCase();
    res.json({ isAdmin });
  });

  // Admin route to list all users
  app.post("/api/admin/list-users", async (req, res) => {
    const { adminEmail } = req.body;
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;

    if (!adminEmail || !initialEmail || adminEmail.toLowerCase() !== initialEmail.toLowerCase()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const users = await getAllUsers();
      res.json({ users });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin route to add users
  app.post("/api/admin/add-user", async (req, res) => {
    const { email, adminEmail } = req.body;
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;

    if (!adminEmail || !initialEmail || adminEmail.toLowerCase() !== initialEmail.toLowerCase()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      await addUser(email);
      res.json({ success: true, message: `User ${email} added successfully` });
    } catch (error) {
      res.status(500).json({ error: "Failed to add user" });
    }
  });

  // Admin route to delete user
  app.post("/api/admin/delete-user", async (req, res) => {
    const { email, adminEmail } = req.body;
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;

    if (!adminEmail || !initialEmail || adminEmail.toLowerCase() !== initialEmail.toLowerCase()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (email.toLowerCase() === initialEmail.toLowerCase()) {
      return res.status(400).json({ error: "Cannot delete the initial admin user" });
    }

    try {
      await deleteUser(email);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
