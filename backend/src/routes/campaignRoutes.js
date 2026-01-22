import express from "express";
import {
  adminListCampaigns,
  adminGetCampaign,
  adminUpdateCampaignStatus as adminUpdateCampaignStatusFull,
  adminAddAllocation,
  adminUpdateAllocation,
  adminDeleteAllocation,
  getCampaignStats
} from "../controllers/campaignProfileController.js";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  adminUpdateCampaignStatus,
  deleteCampaign,
  submitCampaignForReview
} from "../controllers/campaignController.js";
import { protect, authorize } from "../middlewares/auth.js";
import {
  linkProviderToCampaign,
  providerAcceptCampaign
} from "../controllers/campaignRequiredController.js";

const router = express.Router();

// Admin endpoints
router.get("/admin/campaigns", protect, authorize("ADMIN"), adminListCampaigns);
router.get("/admin/campaigns/:id", protect, authorize("ADMIN"), adminGetCampaign);
router.patch("/admin/campaigns/:id/status", protect, authorize("ADMIN"), adminUpdateCampaignStatusFull);
router.post("/admin/campaigns/:id/allocations", protect, authorize("ADMIN"), adminAddAllocation);
router.put("/admin/campaigns/:id/allocations/:allocationId", protect, authorize("ADMIN"), adminUpdateAllocation);
router.delete("/admin/campaigns/:id/allocations/:allocationId", protect, authorize("ADMIN"), adminDeleteAllocation);

// Campaign stats
router.get(":id/stats", getCampaignStats);
// Beneficiary submits campaign for review
router.post(":id/submit", protect, submitCampaignForReview);

// Required endpoints from doc
router.post(":id/link-provider", protect, linkProviderToCampaign);
router.post(":id/provider-accept", protect, providerAcceptCampaign);

// Create a campaign — only BENEFICIARY users
router.post("/", protect, authorize("BENEFICIARY"), createCampaign);

// List campaigns — public
router.get("/", getAllCampaigns);

// Admin campaign endpoints (keep before dynamic /:id if needed)
router.patch("/:id/status", protect, authorize("ADMIN"), adminUpdateCampaignStatus);

// Get single campaign by id — public
router.get("/:id", getCampaignById);

// Update campaign — must be authenticated; controller enforces owner or ADMIN
router.put("/:id", protect, updateCampaign);

// Delete campaign — must be authenticated; controller enforces owner or ADMIN
router.delete("/:id", protect, deleteCampaign);

export default router;
