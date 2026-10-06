import bcrypt from "bcryptjs";
import { findAdminByUsername, findFacultyByUsername, updatePassword } from "../models/Faculty.js";
import { createSession, destroySession } from "../middleware/authMiddleware.js";

export async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }
  const uname = String(username).trim();

  try {
    // 1. Check Admin accounts
    const admin = await findAdminByUsername(uname);
    if (admin && bcrypt.compareSync(password, admin.password_hash)) {
      const token = createSession("admin", admin.username);
      return res.json({
        token,
        role: "admin",
        user: { username: admin.username, name: admin.name, department: "Admin", designation: "Administrator", role: "admin" },
      });
    }

    // 2. Check Faculty / HOD / Principal / Reviewer / Dean accounts
    const faculty = await findFacultyByUsername(uname);
    if (faculty && bcrypt.compareSync(password, faculty.password_hash)) {
      const role = faculty.role || "faculty";
      const token = createSession(role, faculty.username);
      return res.json({
        token,
        role,
        user: {
          username: faculty.username,
          name: faculty.name,
          department: faculty.department,
          designation: faculty.designation,
          role,
          email: faculty.email || "",
        },
      });
    }

    return res.status(401).json({ error: "Invalid username or password." });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error during authentication." });
  }
}

export async function logout(req, res) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) destroySession(token);
  res.json({ ok: true });
}

export async function me(req, res) {
  const { role, username } = req.session;
  try {
    if (role === "admin") {
      const admin = await findAdminByUsername(username);
      return res.json({ role, user: { username: admin.username, name: admin.name, department: "Admin", designation: "Administrator", role: "admin" } });
    }
    const faculty = await findFacultyByUsername(username);
    if (!faculty) return res.json({ role, user: null });
    res.json({
      role,
      user: {
        username: faculty.username,
        name: faculty.name,
        department: faculty.department,
        designation: faculty.designation,
        role: faculty.role,
        email: faculty.email || "",
        phone: faculty.phone || "",
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching user profile." });
  }
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required." });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }

  const { role, username } = req.session;
  const table = role === "admin" ? "admins" : "faculty";

  try {
    const user = role === "admin" ? await findAdminByUsername(username) : await findFacultyByUsername(username);
    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    await updatePassword(table, username, newPassword);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Error updating password." });
  }
}
