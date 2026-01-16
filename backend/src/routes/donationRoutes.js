// src/routes/donationRoutes.js
import express from "express";
import { createDonation, getDonation, getDonationsByCampaign, getDonationsByUser, listDonations } from "../controllers/donationController.js";
import { mpesaCallbackController } from "../controllers/mpesaCallbackController.js";
import { stripeWebhookController } from "../controllers/stripeWebhookController.js";
import { protect, authorize } from "../middlewares/auth.js";
import bodyParser from "body-parser";

const router = express.Router();

// normal JSON body routes
router.post("/", protect, createDonation); // create donation (protected if donor logged in — can also be public)

// user routes
router.get("/me", protect, getDonationsByUser);
router.get("/campaign/:campaignId", protect, getDonationsByCampaign);
router.get("/:id", protect, getDonation);

// Admin list
router.get("/", protect, authorize("ADMIN"), listDonations);

// MPESA webhook (Daraja will POST JSON)
router.post("/webhooks/mpesa", express.json(), mpesaCallbackController);

// Stripe webhook: must use raw body for signature verification
router.post("/webhooks/stripe", bodyParser.raw({ type: "application/json" }), stripeWebhookController);

export default router;
