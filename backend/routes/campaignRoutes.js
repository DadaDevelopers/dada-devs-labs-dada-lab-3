// src/routes/campaignRoutes.js
//Only BENEFICIARY can create; update/delete require authentication and permission checks are enforced in the controller
import express from "express";
import {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign
} from "../controllers/campaignController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Create a campaign — only BENEFICIARY users
router.post("/", protect, authorize("BENEFICIARY"), createCampaign);

// List campaigns — public (no auth). If you want only logged-in users, add `protect`.
router.get("/", getAllCampaigns);

// Get single campaign by id — public
router.get("/:id", getCampaignById);

// Update campaign — must be authenticated; controller enforces owner or ADMIN
router.put("/:id", protect, updateCampaign);

// Delete campaign — must be authenticated; controller enforces owner or ADMIN
router.delete("/:id", protect, deleteCampaign);

export default router;
