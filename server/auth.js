import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fpa_jwt_secret_key_2026_default";

export function createSession(role, username) {
  return jwt.sign({ role, username }, JWT_SECRET, { expiresIn: "24h" });
}

export function destroySession(token) {
  // Stateless JWT doesn't require server memory cleanup, but function kept for API compatibility
  return true;
}

export function requireAuth(...allowedRoles) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: "Not authenticated. Please log in again." });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: "Not authorized for this action." });
      }
      req.session = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
    }
  };
}
