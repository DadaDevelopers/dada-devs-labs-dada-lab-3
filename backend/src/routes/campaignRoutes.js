import express from "express";
import {
  createCampaign,
  confirmProvider,
  confirmBeneficiary,
  getAllCampaigns,
  getMyCampaigns,
  getCampaignById,
  updateCampaign,
  adminUpdateCampaignStatus,
  disburseCampaignFunds,
  getCampaignDisbursement,
  submitCampaignReport,
  getCampaignReports,
  reviewCampaignReport,
  deleteCampaign
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

// Admin campaign endpoints (keep before dynamic /:id if needed)
router.patch("/:id/status", protect, authorize("ADMIN"), adminUpdateCampaignStatus);

// Get single campaign by id — public
router.get("/:id", getCampaignById);

// Update campaign — must be authenticated; controller enforces owner or ADMIN
router.put("/:id", protect, updateCampaign);

//Admin disburses funds
router.post("/:id/disburse", protect, disburseCampaignFunds);

//Beneficiary sees funds disbursed
router.get("/:id/disbursement", protect, getCampaignDisbursement);

/*About Campaign Reports*/
router.post("/:id/reports", protect, submitCampaignReport);

router.get("/:id/reports", protect, getCampaignReports);

router.patch("/:id/reports/:reportId/review", protect, reviewCampaignReport);

// Delete campaign — must be authenticated; controller enforces owner or ADMIN
router.delete("/:id", protect, deleteCampaign);

export default router;
