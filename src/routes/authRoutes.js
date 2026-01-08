/* (Identity, tokens, verification ONLY)
Auth routes: “Who are you and can you prove it?”*/
import express from "express";
import * as ctrl from "../controllers/authController.js";
import { protect } from "../middlewares/auth.js";

const router = express.Router();

// Public identity and access
router.post("/register", ctrl.register);
router.post("/login", ctrl.login);

//Email verification
router.get("/verify-email/:token", ctrl.verifyEmail);
router.post("/resend-verification", ctrl.resendVerification);

//Password recovery
router.post("/forgot-password", ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetPassword);

//Token flows/lifecycle
router.post("/refresh", ctrl.refreshHandler);
router.post("/logout", ctrl.logout);

// Protected
//router.get("/me", protect, ctrl.me);

//Role onboarding (only once, post-login)
router.post("/select-role", protect, ctrl.selectRole);


export default router;
