// src/controllers/donationController.js
import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import Payment from "../models/Payment.js";

import { initiateStkPush } from "../services/mpesa.js";
import { createBtcAddress, checkBtcTransaction } from "../services/bitcoin.service.js";
import { createLightningInvoice, checkPaymentStatus } from "../services/lightning.service.js";

/* ---------------- Helpers ---------------- */

const ensureDecimal = (val) => {
  if (val === undefined || val === null) return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") return val.toString();
  return String(val);
};

const donationToClient = (donation) =>
  typeof donation?.toClient === "function"
    ? donation.toClient()
    : donation;

/* ---------------- CREATE DONATION ---------------- */

export const createDonation = async (req, res, next) => {
  try {
    const {
      campaignId,
      amountFiat,
      currency,
      paymentMethod,
      phone,
      idempotencyKey,
      payer,
      amountSats,
      network,
      notes
    } = req.body;

    if (!amountFiat || !currency || !paymentMethod) {
      return res.status(400).json({ message: "amountFiat, currency, paymentMethod required" });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign || campaign.status !== "ACTIVE") {
      return res.status(404).json({ message: "Campaign unavailable" });
    }

    // ---- Idempotency (donation-level) ----
    if (idempotencyKey) {
      const existing = await Donation.findOne({ idempotencyKey });
      if (existing) {
        return res.json({ donation: donationToClient(existing), note: "existing" });
      }
    }

    // ---- Create Donation (INTENT) ----
    const donation = await Donation.create({
      donorId: req.user?.userId,
      campaignId,
      amountFiat: ensureDecimal(amountFiat),
      currency,
      amountSats: amountSats ? String(amountSats) : null,
      network: network || null,
      paymentMethod,
      payer: payer || null,
      fees: ensureDecimal(req.body.fees ?? 0),
      exchangeRate: ensureDecimal(req.body.exchangeRate ?? 1),
      amountBase: req.body.amountBase ? ensureDecimal(req.body.amountBase) : null,
      status: "PENDING",
      idempotencyKey: idempotencyKey || null,
      notes: notes || null
    });

    /* ---------------- PAYMENT EXECUTION ---------------- */

    switch (paymentMethod) {
      /* -------- MPESA -------- */
      case "MPESA": {
        const msisdn = phone || payer?.phone;
        if (!msisdn) {
          return res.status(400).json({ message: "Phone required for MPESA" });
        }

        const stk = await initiateStkPush({
          phone: msisdn,
          amount: Number(amountFiat),
          accountReference: `DON-${donation._id}`,
          transactionDesc: campaign.title
        });

        await Payment.create({
          donationId: donation._id,
          provider: "MPESA",
          method: "STK",
          amount: ensureDecimal(amountFiat),
          currency,
          externalId: stk.CheckoutRequestID,
          mpesa: {
            phone: msisdn,
            checkoutRequestId: stk.CheckoutRequestID,
            merchantRequestId: stk.MerchantRequestID
          },
          processorResponse: stk
        });

        return res.status(201).json({
          donationId: donation._id,
          instructions: "Confirm MPESA payment on your phone"
        });
      }

      /* -------- BTC ON-CHAIN -------- */
      case "BTC_ONCHAIN": {
        const btc = await createBtcAddress();

        await Payment.create({
          donationId: donation._id,
          provider: "BITCOIN",
          method: "ONCHAIN",
          amount: ensureDecimal(amountFiat),
          currency,
          bitcoin: {
            address: btc.address
          }
        });

        return res.status(201).json({
          donationId: donation._id,
          btcAddress: btc.address,
          network: "bitcoin"
        });
      }

      /* -------- LIGHTNING -------- */
      case "BTC_LIGHTNING": {
        let invoice;
        try {
          invoice = await createLightningInvoice({
            amountFiat,
            memo: `Donation ${donation._id}`
          });
        } catch (e) {
          const msg = (e?.message || String(e)).toLowerCase();
          if (msg.includes("not configured") || msg.includes("lnbits")) {
            const isUnavailable = /503|502|504|unavailable|temporarily/.test(msg);
            return res.status(503).json({
              message: isUnavailable
                ? "The Lightning payment service is temporarily unavailable. Please try again in a few minutes or use another payment method."
                : "Lightning payments are not configured. Please use another payment method or try again later.",
              code: isUnavailable ? "LIGHTNING_SERVICE_UNAVAILABLE" : "LIGHTNING_NOT_CONFIGURED"
            });
          }
          throw e;
        }

        await Payment.create({
          donationId: donation._id,
          provider: "LIGHTNING",
          method: "INVOICE",
          amount: ensureDecimal(amountFiat),
          currency,
          // Use payment hash as stable external ID to satisfy provider+externalId unique index
          externalId: invoice.payment_hash,
          lightning: {
            invoice: invoice.bolt11,
            paymentHash: invoice.payment_hash,
            settled: false
          }
        });

        return res.status(201).json({
          donationId: donation._id,
          invoice: invoice.bolt11,
          ...(invoice.demoInvoice && { demoInvoice: true })
        });
      }

      default:
        return res.status(400).json({ message: "Invalid payment method" });
    }

  } catch (err) {
    next(err);
  }
};

/* ---------------- MPESA WEBHOOK ---------------- */

export const mpesaWebhook = async (req, res, next) => {
  try {
    const { CheckoutRequestID, ResultCode, CallbackMetadata } = req.body;

    const payment = await Payment.findOne({
      provider: "MPESA",
      externalId: CheckoutRequestID
    }).populate("donationId");

    if (!payment) return res.json({ ResultCode: 0 });

    if (payment.status === "SUCCESS") {
      return res.json({ ResultCode: 0 });
    }

    if (ResultCode === 0) {
      const receiptItem = CallbackMetadata?.Item?.find(i => i.Name === "MpesaReceiptNumber");

      payment.status = "SUCCESS";
      payment.paymentReference = receiptItem?.Value || null;
      payment.mpesa.receiptNumber = receiptItem?.Value || null;

      payment.donationId.status = "COMPLETED";
      payment.donationId.paymentReference = receiptItem?.Value || null;

      await payment.save();
      await payment.donationId.save();
    } else {
      payment.status = "FAILED";
      payment.donationId.status = "FAILED";
      await payment.save();
      await payment.donationId.save();
    }

    res.json({ ResultCode: 0 });
  } catch (err) {
    next(err);
  }
};

/* ---------------- BITCOIN CONFIRMATION ---------------- */

export const confirmBitcoinDonation = async (req, res, next) => {
  try {
    const { donationId, txHash } = req.body;

    const payment = await Payment.findOne({
      donationId,
      provider: "BITCOIN"
    }).populate("donationId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const tx = await checkBtcTransaction(txHash, payment.bitcoin.address);

    payment.bitcoin.txHash = txHash;
    payment.bitcoin.confirmations = tx.confirmations;

    if (tx.confirmations >= 2 && payment.status !== "SUCCESS") {
      payment.status = "SUCCESS";
      payment.donationId.status = "COMPLETED";
      payment.donationId.paymentReference = txHash;
    }

    await payment.save();
    await payment.donationId.save();

    res.json({ status: payment.status, confirmations: tx.confirmations });
  } catch (err) {
    next(err);
  }
};

/* ---------------- DONATION STATUS (LIGHTWEIGHT) ---------------- */

// GET /donations/:id/status — return minimal status info for polling
// For Lightning: if still PENDING, ask LNBits if the invoice was paid (so success page works without webhook e.g. localhost)
export const getDonationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Donation id required" });

    let donation = await Donation.findById(id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    // Basic auth: only owner or admin can see detailed status; guests only see status string.
    if (donation.donorId && req.user && String(donation.donorId) !== String(req.user.userId) && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not allowed" });
    }

    // If Lightning and still PENDING, poll LNBits so we can mark COMPLETED without webhook (e.g. when backend is localhost)
    if (donation.status === "PENDING" && donation.paymentMethod === "BTC_LIGHTNING") {
      const payment = await Payment.findOne({ donationId: donation._id, provider: "LIGHTNING" });
      if (!payment && process.env.NODE_ENV !== "production") {
        console.log("[Donation] GET status: no LIGHTNING payment found for donationId=" + id);
      }
      const paymentHash = payment?.lightning?.paymentHash || payment?.externalId;
      if (paymentHash) {
        const paid = await checkPaymentStatus(paymentHash);
        if (process.env.NODE_ENV !== "production") {
          console.log("[Donation] GET status: donationId=" + id + " payment_hash=" + (paymentHash.slice?.(0, 12) || paymentHash) + "... LNBits paid=" + paid);
        }
        if (paid) {
          try {
            payment.status = "SUCCESS";
            payment.lightning.settled = true;
            donation.status = "COMPLETED";
            await payment.save();
            await donation.save();
            donation = await Donation.findById(id);
            if (donation?.status === "COMPLETED") {
              console.log("[Donation] Marked COMPLETED (Lightning) donationId=" + id);
            }
          } catch (err) {
            console.error("[Donation] Failed to mark COMPLETED:", err.message);
          }
        }
      }
    }

    const status = donation.status ? String(donation.status) : "PENDING";
    return res.json({
      id: donation._id,
      status,
      campaignId: donation.campaignId,
      amountFiat: donation.amountFiat,
      paymentMethod: donation.paymentMethod
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------- LIGHTNING WEBHOOK ---------------- */

export const lightningWebhook = async (req, res, next) => {
  try {
    const payment_hash = req.body?.payment_hash ?? req.body?.paymentHash;
    if (!payment_hash) return res.sendStatus(200);

    const payment = await Payment.findOne({
      provider: "LIGHTNING",
      "lightning.paymentHash": payment_hash
    }).populate("donationId");

    if (!payment) return res.sendStatus(200);
    if (payment.status === "SUCCESS") return res.sendStatus(200);

    payment.status = "SUCCESS";
    payment.lightning.settled = true;
    payment.donationId.status = "COMPLETED";

    await payment.save();
    await payment.donationId.save();

    res.sendStatus(200);
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
 * GET /api/donors/receipts/:id
 * Returns a donation receipt (JSON)
 */
export const getDonationReceipt = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donorId", "firstName lastName email")
      .populate("campaignId", "title");

    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    // Donor can only see own receipt, admin can see all
    if (
      req.user.role !== "ADMIN" &&
      donation.donorId._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json({
      receipt: {
        receiptNo: donation.paymentReference,
        donor: donation.donorId,
        campaign: donation.campaignId,
        amount: donation.amountFiat,
        currency: donation.currency,
        paymentMethod: donation.paymentMethod,
        status: donation.status,
        issuedAt: donation.createdAt,
        issuer: "DirectAid"
      }
    });
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
