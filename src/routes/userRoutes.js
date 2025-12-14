import express from "express";
import {
  getMe,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} from "../controllers/userController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Route to get currently logged-in user info
router.get("/me", protect, getMe);

// Update your own profile (name, phone, etc.)
router.put("/me", protect, updateProfile);

// Admin-only routes
router.get("/", protect, authorize("ADMIN"), getAllUsers); // list all users
router.get("/:id", protect, authorize("ADMIN"), getUserById); // get user by id
router.put("/:id/role", protect, authorize("ADMIN"), updateUserRole); // update user role
router.delete("/:id", protect, authorize("ADMIN"), deleteUser); // delete a user

export default router;
