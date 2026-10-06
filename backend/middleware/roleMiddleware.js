export function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.role) {
      return res.status(401).json({ error: "Not authenticated. Please log in again." });
    }
    if (allowedRoles.length && !allowedRoles.includes(req.session.role)) {
      return res.status(403).json({ error: "Not authorized for this action." });
    }
    next();
  };
}
