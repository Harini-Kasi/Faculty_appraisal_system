import crypto from "node:crypto";

/* Simple opaque-token session store, kept in memory server-side.
   Mirrors the original app's "in-memory session, gone on server
   restart" model, but now the source of truth (who you are, your
   department, your designation) lives in the database, not the
   client. */

const sessions = new Map(); // token -> { role: 'admin' | 'faculty', username }

export function createSession(role, username) {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { role, username });
  return token;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function requireAuth(...allowedRoles) {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    const session = token ? sessions.get(token) : null;

    if (!session) {
      return res.status(401).json({ error: "Not authenticated. Please log in again." });
    }
    if (allowedRoles.length && !allowedRoles.includes(session.role)) {
      return res.status(403).json({ error: "Not authorized for this action." });
    }
    req.session = session;
    next();
  };
}
