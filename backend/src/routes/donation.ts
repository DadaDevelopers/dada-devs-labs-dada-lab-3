import { Router } from "express";
import * as donationController from "../controllers/donation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, donationController.createDonation);
router.get("/", donationController.getDonations);
router.get("/:id", donationController.getDonationById);

export default router;
