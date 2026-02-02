import express from "express";
import {
  createCampaign,
  getAllCampaigns,
  getMyCampaigns,
  getCampaignById,
  updateCampaign,
  adminUpdateCampaignStatus,
  deleteCampaign
} from "../controllers/campaignController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Create a campaign — only BENEFICIARY users
router.post("/", protect, authorize("BENEFICIARY"), createCampaign);

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

// Delete campaign — must be authenticated; controller enforces owner or ADMIN
router.delete("/:id", protect, deleteCampaign);

export default router;
