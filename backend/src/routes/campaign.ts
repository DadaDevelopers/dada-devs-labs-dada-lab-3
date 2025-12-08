import { Router } from "express";
import * as campaignController from "../controllers/campaign.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, campaignController.createCampaign);
router.get("/", campaignController.getCampaigns);
router.get("/:id", campaignController.getCampaignById);
router.patch("/:id", authMiddleware, campaignController.updateCampaign);

export default router;
