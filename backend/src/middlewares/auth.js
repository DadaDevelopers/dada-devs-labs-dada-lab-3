import { verifyAccessToken } from "../utils/token.js";
import { User } from "../models/User.js";

// Protect middleware: requires a valid access token. Uses current role/isDeleted from DB so
// after selectRole the backend sees the correct role even if the client hasn't sent a new token yet.
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyAccessToken(token);
    const current = await User.findById(payload.userId).select("role isDeleted").lean();
    if (!current) return res.status(401).json({ message: "Unauthorized" });

    // Use current role and isDeleted from DB so post-onboarding requests see the right role
    req.user = { userId: payload.userId, role: current.role, isDeleted: current.isDeleted };

    if (req.user.isDeleted) {
      return res.status(403).json({
        message: "Account is scheduled for deletion. Restore to continue."
      });
    }
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
