/* (User data & admin management)
User routes: “What data can you view or manage?”*/
import express from "express";
import {
  getMe,
  updateProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  adminDeleteUser
} from "../controllers/userController.js";
import { getAdminStats, getRecentActivity } from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

//Self-service
// Route to get currently logged-in user info
router.get("/me", protect, getMe);
// Update your own profile (name, phone, etc.)
router.put("/me", protect, updateProfile);

// Admin-only routes
router.get("/", protect, authorize("ADMIN"), getAllUsers); // list all users

//STATIC ROUTES FIRST
router.get("/stats", protect, authorize("ADMIN"), getAdminStats); //Admin dashboard stats
router.get("/activity", protect, authorize("ADMIN"), getRecentActivity);
router.get("/activity/:id", protect, authorize("ADMIN"), getRecentActivity);

//DYNAMIC ROUTES NEXT
router.get("/:id", protect, authorize("ADMIN"), getUserById); // get user by id
router.put("/:id/role", protect, authorize("ADMIN"), updateUserRole); // update user role
router.delete("/:id", protect, authorize("ADMIN"), adminDeleteUser); // delete a user

export default router;
