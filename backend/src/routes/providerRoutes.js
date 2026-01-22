import express from "express";
import {
  getPublicProviderProfile,
  uploadProviderDocs,
  addService,
  updateService,
  deleteService,
  adminListProviders,
  adminGetProvider,
  adminVerifyProvider,
  adminSuspendProvider
} from "../controllers/providerProfileController.js";
import { getProviderStats } from "../controllers/providerStatsController.js";
import {
  getProviderByUser,
  createProvider,
  updateProvider,
  getProviderById,
  listProviders,
  approveKYC,
  addPayoutMethod,
  requestPayout,
  deleteProvider,
  sendProviderInvite,
  acceptProviderInvite,
  verifyCampaignDocs,
  listPublicProviders
} from "../controllers/providerController.js";
import {
  listProviderCampaigns,
  getProviderWallet,
  updatePayoutMethod,
  deletePayoutMethod
} from "../controllers/providerAdvancedController.js";
import { protect, authorize } from "../middlewares/auth.js";
import {
  submitProviderVerification,
  setupLightning,
  getProviderTransactions,
  providerWithdraw
} from "../controllers/providerRequiredController.js";

const router = express.Router();

// Public provider profile
router.get("/profile/:publicId", getPublicProviderProfile);

// Provider service catalog management
router.post("/me/services", protect, authorize("PROVIDER"), addService);
router.put("/me/services/:serviceCode", protect, authorize("PROVIDER"), updateService);
router.delete("/me/services/:serviceCode", protect, authorize("PROVIDER"), deleteService);

// Provider stats
router.get("/me/stats", protect, authorize("PROVIDER"), getProviderStats);

// Upload docs (optional helper)
router.post("/me/upload-docs", protect, authorize("PROVIDER"), uploadProviderDocs);

// Admin endpoints
router.get("/admin/providers", protect, authorize("ADMIN"), adminListProviders);
router.get("/admin/providers/:id", protect, authorize("ADMIN"), adminGetProvider);
router.post("/admin/providers/:id/verify", protect, authorize("ADMIN"), adminVerifyProvider);
router.post("/admin/providers/:id/suspend", protect, authorize("ADMIN"), adminSuspendProvider);
// Invite external provider (auth required)
router.post("/invite", protect, sendProviderInvite);

// Accept provider invite (public)
router.get("/invite/accept", acceptProviderInvite);

// Provider verifies campaign docs (auth required)
router.post("/verifications", protect, verifyCampaignDocs);

// Public: List verified/active providers (minimal info, no auth)
router.get("/public", listPublicProviders);

// Provider self-service
router.post("/", protect, authorize("PROVIDER", "ADMIN"), createProvider);
router.get("/me", protect, authorize("PROVIDER"), getProviderByUser);
router.put("/me", protect, authorize("PROVIDER"), updateProvider);

// Required endpoints from doc
router.post("/me/submit-verification", protect, authorize("PROVIDER"), submitProviderVerification);
router.post("/me/lightning/setup", protect, authorize("PROVIDER"), setupLightning);
router.get("/me/transactions", protect, authorize("PROVIDER"), getProviderTransactions);
router.post("/me/withdraw", protect, authorize("PROVIDER"), providerWithdraw);

router.post("/me/payout-methods", protect, authorize("PROVIDER"), addPayoutMethod);
// Update/delete payout method
router.put("/me/payout-methods/:payoutMethodId", protect, authorize("PROVIDER"), updatePayoutMethod);
router.delete("/me/payout-methods/:payoutMethodId", protect, authorize("PROVIDER"), deletePayoutMethod);

// Provider wallet/balance
router.get("/me/wallet", protect, authorize("PROVIDER"), getProviderWallet);

// List campaigns for provider
router.get("/me/campaigns", protect, authorize("PROVIDER"), listProviderCampaigns);
router.post("/me/request-payout", protect, authorize("PROVIDER"), requestPayout);

// Admin
router.get("/", protect, authorize("ADMIN"), listProviders);
router.get("/:id", protect, authorize("ADMIN"), getProviderById);
router.put("/:id/kyc", protect, authorize("ADMIN"), approveKYC);
router.delete("/:id", protect, authorize("ADMIN"), deleteProvider);

export default router;
