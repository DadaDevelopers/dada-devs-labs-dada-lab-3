/* (User data & admin management)
User routes: “What data can you view or manage?”*/
import express from "express";
import {
  // self-service
  getMe,
  getBeneficiaryMetrics,
  getBeneficiaryDisbursements,
  updateProfile,
  requestAccountDeletion,
  restoreAccount,
  setConsentContact,
  requestEmailChange,
  requestPhoneChange,

  // public
  getPublicProfile,

  // admin
  getAllUsers,
  getUserById,
  updateUserRole,
  adminDeleteUser,
  adminVerifyIdentity
} from "../controllers/userController.js";
import { getAdminStats, getRecentActivity } from "../controllers/adminController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

/* PUBLIC ROUTES */
// Public beneficiary profile (no auth)
router.get("/public/:publicId", getPublicProfile);

/* SELF-SERVICE ROUTES */
// Route to get currently logged-in user's full profile/info
router.get("/me", protect, getMe);

// Beneficiary dashboard metrics (BENEFICIARY role only)
router.get("/me/metrics", protect, getBeneficiaryMetrics);

// Beneficiary list of disbursements (BENEFICIARY role only)
router.get("/me/disbursements", protect, authorize("BENEFICIARY"), getBeneficiaryDisbursements);

// Update your own profile (beneficiary / donor / provider) -(name, phone, etc.)
router.put("/me", protect, updateProfile);

// Explicit consent endpoint (audit-friendly)
router.post("/me/consent-contact", protect, setConsentContact);

// Request email change (verification handled elsewhere)
router.post("/me/request-email-change", protect, requestEmailChange);

// Request phone change (verification handled elsewhere)
router.post("/me/request-phone-change", protect, requestPhoneChange);

// User requests account deletion (30-day recovery window)
router.post("/me/delete-request", protect, requestAccountDeletion);

// User restores account within recovery window
router.post("/me/restore", protect, restoreAccount);

/* ADMIN-ONLY ROUTES */
// List all users (pagination, filters)
router.get("/", protect, authorize("ADMIN"), getAllUsers); // list all users

//IMPORTANT: Static routes first (avoid collision with :id)
//Admin dashboard stats
router.get("/stats", protect, authorize("ADMIN"), getAdminStats); //Admin dashboard stats

//Recent activity (all or by user)
router.get("/activity", protect, authorize("ADMIN"), getRecentActivity);
router.get("/activity/:id", protect, authorize("ADMIN"), getRecentActivity);

//DYNAMIC ROUTES NEXT
router.get("/:id", protect, authorize("ADMIN"), getUserById); // get user by id
router.put("/:id/role", protect, authorize("ADMIN"), updateUserRole); // Change/update user role

// Verify beneficiary identity / KYC decision
router.post(
  "/:id/verify-identity",
  protect,
  authorize("ADMIN", "SUPER_ADMIN"),
  adminVerifyIdentity
);

// Soft-delete user (admin action)
router.delete("/:id", protect, authorize("ADMIN"), adminDeleteUser); // delete a user

export default router;
