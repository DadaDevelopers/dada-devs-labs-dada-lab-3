import express from "express";
import {
  createDonation,
  mpesaWebhook,
  lightningWebhook,
  confirmBitcoinDonation,
  getDonation,
  getDonationsByCampaign,
  getDonationsByUser,
  getDonationReceipt,
  listDonations,
  getDonationStatus
} from "../controllers/donationController.js";

import { getDonorMetrics, getReceiptPDF, emailReceipt } from "../controllers/donorMetricsController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Normal JSON body routes
router.post("/", protect, createDonation);

// ----------------- Webhooks (public, provider verifies) -----------------
router.post("/webhooks/mpesa", express.json(), mpesaWebhook);
router.post("/webhooks/lightning", express.json(), lightningWebhook);

// ----------------- Crypto confirmation -----------------
router.post("/bitcoin/confirm", protect, confirmBitcoinDonation);

// ----------------- User routes -----------------
router.get("/me", protect, getDonationsByUser);
router.get("/:id", protect, getDonation);
router.get("/:id/status", protect, getDonationStatus); // NEW: status polling
router.get("/campaign/:campaignId", protect, getDonationsByCampaign);

// ----------------- Admin -----------------
router.get("/", protect, authorize("ADMIN"), listDonations);

// ----------------- Donor data / receipts -----------------
router.get("/me/donor-metrics", protect, authorize("DONOR"), getDonorMetrics);
router.get("/receipts/:id", protect, authorize("DONOR", "ADMIN"), getDonationReceipt);
router.get("/donors/receipts/:id/pdf", protect, getReceiptPDF);
router.post("/donors/receipts/:id/email", protect, emailReceipt);

export default router;
