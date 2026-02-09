// src/routes/donationRoutes.js
import express from "express";
import { createDonation, mpesaWebhook, confirmBitcoinDonation, lightningWebhook, getDonation, getDonationsByCampaign, getDonationsByUser, getDonationReceipt, listDonations } from "../controllers/donationController.js";
//import { mpesaCallbackController } from "../controllers/mpesaCallbackController.js";
//import { stripeWebhookController } from "../controllers/stripeWebhookController.js";
import { getDonorMetrics, getReceiptPDF, emailReceipt } from "../controllers/donorMetricsController.js";

import { protect, authorize } from "../middlewares/auth.js";
import bodyParser from "body-parser";

const router = express.Router();

// normal JSON body routes
router.post("/", protect, createDonation); // create donation (protected if donor logged in — can also be public)

/*Provider webhooks : no auth*/
// MPESA webhook (Daraja will POST JSON)
router.post("/webhooks/mpesa", protect, mpesaWebhook);
//router.post("/webhooks/mpesa", express.json(), mpesaCallbackController);
router.post("/webhooks/lightning", protect, lightningWebhook);

// ---- Crypto confirmation ----
router.post("/bitcoin/confirm", protect, confirmBitcoinDonation);

// user routes - queries
router.get("/me", protect, getDonationsByUser);
router.get("/:id", protect, getDonation);
router.get("/campaign/:campaignId", protect, getDonationsByCampaign);

// Admin list
router.get("/", protect, authorize("ADMIN"), listDonations);

// Stripe webhook: must use raw body for signature verification
//router.post("/webhooks/stripe", bodyParser.raw({ type: "application/json" }), stripeWebhookController);

//Donor data(metrics)
router.get("/me/donor-metrics", protect, authorize("DONOR"), getDonorMetrics);

// Donor receipt
router.get("/receipts/:id", protect, authorize("DONOR", "ADMIN"), getDonationReceipt);

router.get("/donors/receipts/:id/pdf", protect, getReceiptPDF);
router.post("/donors/receipts/:id/email", protect, emailReceipt);
export default router;
