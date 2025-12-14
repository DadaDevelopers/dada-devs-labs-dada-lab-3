import express from "express";
import {
  getProviderByUser,
  createProvider,
  updateProvider,
  getProviderById,
  listProviders,
  approveKYC,
  addPayoutMethod,
  requestPayout,
  deleteProvider
} from "../controllers/providerController.js";

import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// --------------------------
// Provider self-service routes
// --------------------------
router.post("/", protect, authorize("PROVIDER", "ADMIN"), createProvider); // Provider creates their profile
router.get("/me", protect, authorize("PROVIDER"), getProviderByUser);      // Get provider profile of logged-in user
router.put("/me", protect, authorize("PROVIDER"), updateProvider);          // Update profile
router.post("/me/payout", protect, authorize("PROVIDER"), addPayoutMethod); // Add payout method
router.post("/me/request-payout", protect, authorize("PROVIDER"), requestPayout); // Request payout

// --------------------------
// Admin / public routes
// --------------------------
router.get("/", protect, authorize("ADMIN"), listProviders);               // List all providers
router.get("/:id", protect, authorize("ADMIN"), getProviderById);          // Get provider by ID
router.put("/:id/kyc", protect, authorize("ADMIN"), approveKYC);           // Admin approves/rejects KYC
router.delete("/:id", protect, authorize("ADMIN"), deleteProvider);        // Admin deletes provider

export default router;
