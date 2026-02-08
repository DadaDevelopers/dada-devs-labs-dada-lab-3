import express from "express";
import { 
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  adminUpdateCampaignStatus,
  deleteCampaign,
  linkProviderToCampaign,
  providerAcceptCampaign,
  submitCampaignForReview 
} from "../controllers/campaignController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Create a campaign — only BENEFICIARY users
router.post("/", protect, authorize("BENEFICIARY"), createCampaign);

// List campaigns — public
router.get("/", getAllCampaigns);

// Add this route BEFORE the /:id routes (order matters!)
router.post("/:id/link-provider", protect, linkProviderToCampaign);
router.post("/:id/provider-accept", protect, authorize("PROVIDER"), providerAcceptCampaign);
router.post("/:id/submit", protect, submitCampaignForReview);

// Admin campaign endpoints (keep before dynamic /:id if needed)
router.patch("/:id/status", protect, authorize("ADMIN"), adminUpdateCampaignStatus);

// Get single campaign by id — public
router.get("/:id", getCampaignById);

// Update campaign — must be authenticated; controller enforces owner or ADMIN
router.put("/:id", protect, updateCampaign);

// Delete campaign — must be authenticated; controller enforces owner or ADMIN
router.delete("/:id", protect, deleteCampaign);

export default router;
