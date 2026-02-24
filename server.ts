import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("access_control.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    request_count INTEGER DEFAULT 0
  )
`);

// Seed initial user if provided in ENV
const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;
if (initialEmail) {
  const stmt = db.prepare("INSERT OR IGNORE INTO users (email) VALUES (?)");
  stmt.run(initialEmail);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/verify", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const user = db.prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)").get(email) as any;
      
      if (!user) {
        return res.status(403).json({ error: "Email không có quyền truy cập!" });
      }

      res.json({ 
        success: true, 
        email: user.email,
        requestCount: user.request_count
      });
    } catch (error: any) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Lỗi hệ thống khi xác thực" });
    }
  });

  app.post("/api/usage/increment", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    try {
      const result = db.prepare("UPDATE users SET request_count = request_count + 1 WHERE LOWER(email) = LOWER(?)").run(email);
      
      if (result.changes === 0) {
        return res.status(403).json({ error: "Email không tồn tại trong hệ thống" });
      }

      const user = db.prepare("SELECT request_count FROM users WHERE LOWER(email) = LOWER(?)").get(email) as any;
      res.json({ success: true, newCount: user.request_count });
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
  app.post("/api/admin/list-users", (req, res) => {
    const { adminEmail } = req.body;
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;
    
    if (!adminEmail || !initialEmail || adminEmail.toLowerCase() !== initialEmail.toLowerCase()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const users = db.prepare("SELECT * FROM users ORDER BY request_count DESC").all();
      res.json({ users });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin route to add users
  app.post("/api/admin/add-user", (req, res) => {
    const { email, adminEmail } = req.body;
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;

    if (!adminEmail || !initialEmail || adminEmail.toLowerCase() !== initialEmail.toLowerCase()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      db.prepare("INSERT OR REPLACE INTO users (email) VALUES (?)").run(email);
      res.json({ success: true, message: `User ${email} added successfully` });
    } catch (error) {
      res.status(500).json({ error: "Failed to add user" });
    }
  });

  // Admin route to delete user
  app.post("/api/admin/delete-user", (req, res) => {
    const { email, adminEmail } = req.body;
    const initialEmail = process.env.INITIAL_ALLOWED_EMAIL;

    if (!adminEmail || !initialEmail || adminEmail.toLowerCase() !== initialEmail.toLowerCase()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (email.toLowerCase() === initialEmail.toLowerCase()) {
      return res.status(400).json({ error: "Cannot delete the initial admin user" });
    }

    try {
      db.prepare("DELETE FROM users WHERE LOWER(email) = LOWER(?)").run(email);
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
