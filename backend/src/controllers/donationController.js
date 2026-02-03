// src/controllers/donationController.js
import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import Payment from "../models/Payment.js";
import { User } from "../models/User.js";
import { initiateStkPush } from "../services/mpesa.js";
import { createPaymentIntent, constructEvent } from "../services/stripe.js";
import config from "../config/config.js";

/**
 * Helpers
 */
function ensureDecimal(val) {
  // Accept number or string. Return Decimal128-compatible string.
  if (val === undefined || val === null) return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") return val.toString();
  // fallback
  return String(val);
}

function donationToClient(donation) {
  if (!donation) return donation;
  if (typeof donation.toClient === "function") return donation.toClient();
  // fallback basic conversion
  const obj = donation.toObject ? donation.toObject({ getters: true }) : { ...donation };
  if (obj.amountFiat) obj.amountFiat = parseFloat(obj.amountFiat.toString());
  if (obj.fees) obj.fees = parseFloat(obj.fees.toString());
  if (obj.exchangeRate) obj.exchangeRate = parseFloat(obj.exchangeRate.toString());
  if (obj.amountBase) obj.amountBase = parseFloat(obj.amountBase.toString());
  return obj;
}

/**
 * Create a new donation (PENDING)
 * - No process payment provider call here (implement provider integration where noted)
 * - Uses idempotencyKey/externalId/paymentReference if provided to avoid duplicates
 */
export const createDonation = async (req, res, next) => {
  try {
    const {
      campaignId,
      amountFiat,
      currency,
      paymentMethod,
      provider,
      idempotencyKey,
      paymentReference,
      externalId,
      amountSats,
      network,
      payer
    } = req.body;

    if (!amountFiat || !currency || !paymentMethod) {
      return res.status(400).json({ message: "amountFiat, currency and paymentMethod are required" });
    }

    // Optionally validate campaign exists
    if (campaignId) {
      const camp = await Campaign.findById(campaignId);
      if (!camp) return res.status(404).json({ message: "Campaign not found" });
    }

    // Idempotency check: if idempotencyKey/externalId/paymentReference provided, try to find existing donation
    let existing = null;
    if (idempotencyKey) existing = await Donation.findOne({ idempotencyKey });
    if (!existing && externalId) existing = await Donation.findOne({ externalId });
    if (!existing && paymentReference) existing = await Donation.findOne({ paymentReference });

    if (existing) {
      // If found, return current state (useful if frontend retried)
      return res.status(200).json({ donation: donationToClient(existing), note: "existing" });
    }

    // Create donation record (PENDING)
    const donation = await Donation.create({
      donorId: req.user ? req.user.userId : null,
      campaignId: campaignId || null,
      amountFiat: ensureDecimal(amountFiat),
      currency,
      amountSats: amountSats ? String(amountSats) : null,
      network: network || null,
      paymentMethod,
      provider: provider || null,
      paymentReference: paymentReference || null,
      externalId: externalId || null,
      processorResponse: null,
      payer: payer || null,
      fees: ensureDecimal(req.body.fees ?? 0),
      exchangeRate: ensureDecimal(req.body.exchangeRate ?? 1),
      amountBase: req.body.amountBase ? ensureDecimal(req.body.amountBase) : null,
      status: "PENDING",
      idempotencyKey: idempotencyKey || null,
      receiptUrl: null,
      notes: req.body.notes || null
    });
    // ---------- M-PESA STK Push flow ----------
      if (paymentMethod === "MPESA") {
        const phone = (payer && payer.phone) || req.body.phone || req.body.msisdn;
        if (!phone) {
          return res.status(400).json({ message: "Phone required for M-PESA" });
        }
        // initiate stk push
        const mpesaResp = await initiateStkPush({
          phone,
          amount: parseFloat(amountFiat),
          accountReference: `Donation:${donation._id}`,
          transactionDesc: `Donation to campaign ${campaignId || "general"}`
        });

        // create Payment record
        const payment = await Payment.create({
          donationId: donation._id,
          provider: "MPESA",
          method: "STK",
          amount: ensureDecimal(amountFiat),
          currency,
          status: "PENDING",
          externalId: mpesaResp.CheckoutRequestID || null,
          mpesa: {
            phone,
            merchantRequestId: mpesaResp.MerchantRequestID,
            checkoutRequestId: mpesaResp.CheckoutRequestID
          },
          processorResponse: mpesaResp
        });

        // Optional: store payment reference convenience on donation (not required)
        donation.processorResponse = null; // avoid duplicating large payload
        await donation.save();

        return res.status(201).json({
          donation: donationToClient(donation),
          paymentInstructions: {
            method: "MPESA_STK",
            note: "Confirm payment on phone",
            raw: mpesaResp
          }
        });
      }

      // ---------- STRIPE Card flow ----------
      if (paymentMethod === "STRIPE" || paymentMethod === "CARD") {
        // Create a PaymentIntent and return client_secret to frontend
        // Convert amountFiat to cents (assume currency minor unit)
        // Caution: Decimal128->Number conversion
        const amountFloat = parseFloat(ensureDecimal(amountFiat));
        // At this layer we expect e.g. USD/EUR amounts. If KES, adapt minor unit accordingly.
        // For simplicity: we'll assume currency uses 2 decimals (USD, EUR).
        const amountCents = Math.round(amountFloat * 100);

        const metadata = {
          donationId: donation._id.toString(),
          campaignId: donation.campaignId ? donation.campaignId.toString() : "",
          donorId: donation.donorId ? donation.donorId.toString() : ""
        };

        const pi = await createPaymentIntent({ amountCents, currency, metadata });

        // create Payment record
        const payment = await Payment.create({
          donationId: donation._id,
          provider: "STRIPE",
          method: "CARD",
          amount: ensureDecimal(amountFiat),
          currency,
          status: "PENDING",
          externalId: pi.id,
          stripe: { paymentIntentId: pi.id },
          processorResponse: { paymentIntentId: pi.id }
        });

        // optionally update donation with a light reference (not necessary)
        await donation.save();

        return res.status(201).json({
          donation: donationToClient(donation), payment,
          paymentInstructions: {
            method: "STRIPE",
            clientSecret: pi.client_secret,
            paymentIntentId: pi.id
          }
        });
      }

      // ---------- default: return donation with placeholder instructions ----------
      return res.status(201).json({
        donation: donationToClient(donation),
        paymentInstructions: { type: "PLACEHOLDER", message: "Implement provider integration for this paymentMethod." }
      });

    } catch (err) {
      next(err);
    }
  };


    // TODO: initiate payment with provider SDK here.
    // Example (pseudo):
    // if (paymentMethod === "MPESA") {
    //   const mpesaResp = await mpesa.lipaNaMpesa({...});
    //   donation.paymentReference = mpesaResp.merchantRequestID || mpesaResp.checkoutRequestID;
    //   donation.processorResponse = mpesaResp;
    //   await donation.save();
    //   return res.status(201).json({ donation: donationToClient(donation), paymentInstructions: { type: "mpesa_stk_push", checkoutId: mpesaResp.checkoutRequestID } });
    // }
    

/**
 * Generic webhook handler to update donation status from provider callbacks.
 * Expects provider to send either externalId, paymentReference or idempotencyKey (or donationId)
 * Body shape (example): { externalId, paymentReference, status, transactionHash, confirmations, processorResponse }
 *
 * This endpoint must validate provider signature (not included here) before trusting payload.
 */
export const webhookHandler = async (req, res, next, session = null) => {
  try {
    const payload = req.body;
    const {
      donationId, externalId, paymentReference, idempotencyKey,
      status, transactionHash, confirmations, processorResponse, provider
    } = payload;

    //Find donation by several keys
    let donation = null;
    if (donationId) donation = await Donation.findById(donationId);
    if (!donation && externalId) donation = await Donation.findOne({ externalId });
    if (!donation && paymentReference) donation = await Donation.findOne({ paymentReference });
    if (!donation && idempotencyKey) donation = await Donation.findOne({ idempotencyKey });

    if (!donation) {
      // Option: create a record or ignore. We'll respond 404 so provider can log.
      return res.status(404).json({ message: "Donation not found for webhook" });
    }

    // Idempotency protection: if already COMPLETED and webhook indicates COMPLETED, return ok
    if (donation.status === "COMPLETED" && (status === "COMPLETED" || status === "SUCCESS")) {
      return res.status(200).json({ message: "Already completed" });
    }

    // Update fields from webhook (do not blindly trust everything; validate as needed)
    if (externalId) donation.externalId = externalId;
    if (paymentReference) donation.paymentReference = paymentReference;
    if (transactionHash) donation.transactionHash = transactionHash;
    if (confirmations !== undefined) donation.confirmations = confirmations;
    if (provider) donation.provider = provider;

    // Save raw processor response for audits
    donation.processorResponse = processorResponse || req.body;

    // Map provider status to our internal status
    const mapping = (s) => {
      if (!s) return donation.status;
      const up = String(s).toUpperCase();
      if (["COMPLETED", "SUCCESS", "PAID"].includes(up)) return "COMPLETED";
      if (["FAILED", "ERROR"].includes(up)) return "FAILED";
      return up === "REFUNDED" ? "REFUNDED" : donation.status;
    };

    const newStatus = mapping(status);
    //donation.status = newStatus;

    // Optionally set receipt URL
    if (processorResponse && processorResponse.receiptUrl) donation.receiptUrl = processorResponse.receiptUrl;

    // Save — triggers post-save hook which updates campaign.amountRaised when status is COMPLETED
    await donation.save();

    return res.status(200).json({ message: "Webhook processed", donation: donationToClient(donation) });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single donation by id (public/admin/owner)
 */
export const getDonation = async (req, res, next) => {
  try {
    const id = req.params.id;
    const donation = await Donation.findById(id).populate("donorId", "firstName lastName email").populate("campaignId");
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // If not admin, ensure owner or related
    if (req.user && req.user.role !== "ADMIN") {
      if (donation.donorId && donation.donorId._id.toString() !== req.user.userId && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    return res.json({ donation: donationToClient(donation) });
  } catch (err) {
    next(err);
  }
};

/**
 * List donations for a campaign (admin or campaign owner)
 */
export const getDonationsByCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    // Only allow beneficiary/owner or admin
    if (req.user.role !== "ADMIN" && campaign.beneficiaryId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const donations = await Donation.find({ campaignId }).sort({ createdAt: -1 });
    return res.json({ donations: donations.map(donationToClient) });
  } catch (err) {
    next(err);
  }
};

/**
 * List donations made by currently logged-in user
 */
export const getDonationsByUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const donations = await Donation.find({ donorId: userId }).sort({ createdAt: -1 });
    return res.json({ donations: donations.map(donationToClient) });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: list donations with optional filters
 */
export const listDonations = async (req, res, next) => {
  try {
    // filters: status, paymentMethod, provider, dateFrom, dateTo, campaignId
    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.paymentMethod) q.paymentMethod = req.query.paymentMethod;
    if (req.query.provider) q.provider = req.query.provider;
    if (req.query.campaignId) q.campaignId = req.query.campaignId;
    if (req.query.donorId) q.donorId = req.query.donorId;

    if (req.query.dateFrom || req.query.dateTo) {
      q.createdAt = {};
      if (req.query.dateFrom) q.createdAt.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) q.createdAt.$lte = new Date(req.query.dateTo);
    }

    const donations = await Donation.find(q).sort({ createdAt: -1 }).limit(1000);
    return res.json({ donations: donations.map(donationToClient) });
  } catch (err) {
    next(err);
  }
};
