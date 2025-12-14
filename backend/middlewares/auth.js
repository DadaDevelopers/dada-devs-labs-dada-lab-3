import { verifyAccessToken } from "../utils/token.js";

// Protect middleware: requires a valid access token
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload; // { userId, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Authorize middleware: restrict by roles
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};
