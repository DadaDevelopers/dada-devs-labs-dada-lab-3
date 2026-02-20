import express from "express";
import {
  createCampaign,
  confirmProvider,
  confirmBeneficiary,
  getAllCampaigns,
  getMyCampaigns,
  getCampaignsForProvider,
  getCampaignById,
  getCampaignWithdrawals,
  getCampaignTransactions,
  updateCampaign,
  adminUpdateCampaignStatus,
  adminUpdateCampaignVisibility,
  deleteCampaign,
  linkProviderToCampaign,
  providerAcceptCampaign,
  submitCampaignForReview,
  disburseCampaignFunds,
  beneficiaryDisburseToProvider,
  getCampaignDisbursement,
  submitCampaignReport,
  getCampaignReports,
  reviewCampaignReport,
} from "../controllers/campaignController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Create a campaign — only BENEFICIARY users
router.post("/", protect, authorize("BENEFICIARY"), createCampaign);

// Provider confirms they will provide the service
router.patch("/:id/confirm-provider", protect, confirmProvider);

// Beneficiary confirms they have received the service
router.patch("/:id/confirm-beneficiary", protect, authorize("BENEFICIARY"), confirmBeneficiary);

// List campaigns — public (supports ?beneficiaryId=, ?confirmationStatus=)
router.get("/", getAllCampaigns);

// My campaigns — authenticated BENEFICIARY only (must be before /:id)
router.get("/me", protect, authorize("BENEFICIARY"), getMyCampaigns);

// Campaigns for current provider (assigned + invited by manual email)
router.get("/for-provider", protect, authorize("PROVIDER"), getCampaignsForProvider);

// Provider linking and acceptance
router.post("/:id/link-provider", protect, linkProviderToCampaign);
router.post("/:id/provider-accept", protect, authorize("PROVIDER"), providerAcceptCampaign);
router.post("/:id/submit", protect, submitCampaignForReview);

// Admin campaign endpoints (keep before dynamic /:id if needed)
router.patch("/:id/status", protect, authorize("ADMIN"), adminUpdateCampaignStatus);
router.patch("/:id/visibility", protect, authorize("ADMIN"), adminUpdateCampaignVisibility);

// Get single campaign by id — public
router.get("/:id", getCampaignById);
// Campaign transparency: withdrawals and transactions (public)
router.get("/:id/withdrawals", getCampaignWithdrawals);
router.get("/:id/transactions", getCampaignTransactions);

// Update campaign — must be authenticated; controller enforces owner or ADMIN
router.put("/:id", protect, updateCampaign);

// Admin disburses funds
router.post("/:id/disburse", protect, authorize("ADMIN"), disburseCampaignFunds);

// Beneficiary disburses to provider (campaign owner)
router.post("/:id/disburse-to-provider", protect, authorize("BENEFICIARY"), beneficiaryDisburseToProvider);

// Beneficiary sees funds disbursed
router.get("/:id/disbursement", protect, getCampaignDisbursement);

/* About Campaign Reports */
router.post("/:id/reports", protect, submitCampaignReport);
router.get("/:id/reports", protect, getCampaignReports);
router.patch("/:id/reports/:reportId/review", protect, reviewCampaignReport);

// Delete campaign — must be authenticated; controller enforces owner or ADMIN
router.delete("/:id", protect, deleteCampaign);

export default router;