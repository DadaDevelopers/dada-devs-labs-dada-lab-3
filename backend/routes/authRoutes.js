import express from "express";
import {
  register,
  login,
  logout,
  me,
  refreshHandler,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/refresh", refreshHandler);

// Protected
router.get("/me", protect, me);
router.post("/logout", protect, logout);

export default router;
