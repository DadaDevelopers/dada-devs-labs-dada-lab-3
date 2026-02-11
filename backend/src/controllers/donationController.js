// src/controllers/donationController.js
import mongoose from "mongoose";
import Donation from "../models/Donation.js";
import Campaign from "../models/Campaign.js";
import Payment from "../models/Payment.js";

import { initiateStkPush } from "../services/mpesa.js";
import { createBtcAddress, checkBtcTransaction } from "../services/bitcoin.service.js";
import { createLightningInvoice } from "../services/lightning.service.js";
import * as exchangeRateService from "../services/exchangeRate.service.js";

/* ---------------- Helpers ---------------- */
const ensureDecimal = (val) => {
  if (val === undefined || val === null) return null;
  if (typeof val === "string") return val;
  if (typeof val === "number") return val.toString();
  return String(val);
};

const donationToClient = (donation) =>
  typeof donation?.toClient === "function" ? donation.toClient() : donation;

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

    // Normalize payment method
    const normalizedMethod = (paymentMethod || "").toString().toLowerCase();
    if (!["mpesa","onchain","lightning"].includes(normalizedMethod)) {
      return res.status(400).json({ message: "Invalid paymentMethod. Allowed: mpesa, onchain, lightning" });
    }

    // Idempotency
    if (idempotencyKey) {
      const existing = await Donation.findOne({ idempotencyKey });
      if (existing) {
        return res.json({ donation: donationToClient(existing), note: "existing" });
      }
    }

    // Compute sats safely
    let computedSats = null;
    if (amountSats) {
      computedSats = String(amountSats);
    } else if (exchangeRateService?.getSatsPerFiat) {
      const satsPerUnit = await exchangeRateService.getSatsPerFiat(currency);
      computedSats = String(Math.round(Number(amountFiat) * satsPerUnit));
    }

    // Create donation
    const donation = await Donation.create({
      donorId: req.user?.userId,
      campaignId,
      amountFiat: ensureDecimal(amountFiat),
      currency,
      amountSats: computedSats,
      network: network || null,
      paymentMethod: normalizedMethod,
      payer: payer || null,
      fees: ensureDecimal(req.body.fees ?? 0),
      exchangeRate: ensureDecimal(req.body.exchangeRate ?? 1),
      amountBase: req.body.amountBase ? ensureDecimal(req.body.amountBase) : null,
      status: "PENDING",
      idempotencyKey: idempotencyKey || null,
      notes: notes || null
    });

    // ---------------- PAYMENT EXECUTION ----------------
    switch (normalizedMethod) {
      case "mpesa": {
        const msisdn = phone || payer?.phone;
        if (!msisdn) return res.status(400).json({ message: "Phone required for MPESA" });

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
          mpesa: { phone: msisdn, checkoutRequestId: stk.CheckoutRequestID, merchantRequestId: stk.MerchantRequestID },
          processorResponse: stk
        });

        return res.status(201).json({
          donationId: donation._id,
          instructions: "Confirm MPESA payment on your phone"
        });
      }

      case "onchain": {
        const btc = await createBtcAddress({ donationId: donation._id });
        await Payment.create({
          donationId: donation._id,
          provider: "BITCOIN",
          method: "ONCHAIN",
          amount: ensureDecimal(amountFiat),
          currency,
          bitcoin: { address: btc.address }
        });

        return res.status(201).json({
          donationId: donation._id,
          btcAddress: btc.address,
          network: "bitcoin",
          amountSats: donation.amountSats,
          amountBTC: donation.amountSats ? (Number(donation.amountSats)/1e8).toString() : null
        });
      }

      case "lightning": {
        const invoice = await createLightningInvoice({
          amountFiat,
          amountSats: computedSats,
          memo: `Donation ${donation._id}`
        });

        await Payment.create({
          donationId: donation._id,
          provider: "LIGHTNING",
          method: "INVOICE",
          amount: ensureDecimal(amountFiat),
          currency,
          lightning: { invoice: invoice.bolt11, paymentHash: invoice.payment_hash, settled: false }
        });

        return res.status(201).json({
          donationId: donation._id,
          invoice: invoice.bolt11,
          amountSats: invoice.amountSats || donation.amountSats,
          expiresAt: invoice.expiresAt || null
        });
      }

      default:
        return res.status(400).json({ message: "Invalid payment method" });
    }
  } catch (err) { next(err); }
};

/* ---------------- MPESA WEBHOOK ---------------- */
export const mpesaWebhook = async (req, res, next) => {
  try {
    const { CheckoutRequestID, ResultCode, CallbackMetadata } = req.body;

    const payment = await Payment.findOne({ provider: "MPESA", externalId: CheckoutRequestID }).populate("donationId");
    if (!payment) return res.json({ ResultCode: 0 });
    if (payment.status === "SUCCESS") return res.json({ ResultCode: 0 });

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
  } catch (err) { next(err); }
};

/* ---------------- BITCOIN CONFIRMATION ---------------- */
export const confirmBitcoinDonation = async (req, res, next) => {
  try {
    const { donationId, txHash } = req.body;

    const payment = await Payment.findOne({ donationId, provider: "BITCOIN" }).populate("donationId");
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const tx = await checkBtcTransaction(txHash, payment.bitcoin.address);
    payment.bitcoin.txHash = txHash;
    payment.bitcoin.confirmations = tx.confirmations || 0;

    if (tx.confirmations >= 2 && payment.status !== "SUCCESS") {
      payment.status = "SUCCESS";
      payment.donationId.status = "COMPLETED";
      payment.donationId.paymentReference = txHash;
    }

    await payment.save();
    await payment.donationId.save();
    res.json({ status: payment.status, confirmations: tx.confirmations });
  } catch (err) { next(err); }
};

/* ---------------- LIGHTNING WEBHOOK ---------------- */
export const lightningWebhook = async (req, res, next) => {
  try {
    const { payment_hash } = req.body;
    const payment = await Payment.findOne({ provider: "LIGHTNING", "lightning.paymentHash": payment_hash }).populate("donationId");
    if (!payment) return res.sendStatus(200);
    if (payment.status === "SUCCESS") return res.sendStatus(200);

    payment.status = "SUCCESS";
    payment.lightning.settled = true;
    payment.donationId.status = "COMPLETED";

    await payment.save();
    await payment.donationId.save();
    res.sendStatus(200);
  } catch (err) { next(err); }
};

/* ---------------- GET DONATION ---------------- */
export const getDonation = async (req, res, next) => {
  try {
    const id = req.params.id;
    const donation = await Donation.findById(id).populate("donorId", "firstName lastName email").populate("campaignId");
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    if (req.user?.role !== "ADMIN" && donation.donorId?._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json({ donation: donationToClient(donation) });
  } catch (err) { next(err); }
};

/* ---------------- GET DONATIONS BY CAMPAIGN ---------------- */
export const getDonationsByCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    if (req.user.role !== "ADMIN" && campaign.beneficiaryId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const donations = await Donation.find({ campaignId }).sort({ createdAt: -1 });
    return res.json({ donations: donations.map(donationToClient) });
  } catch (err) { next(err); }
};

/* ---------------- GET DONATIONS BY USER ---------------- */
export const getDonationsByUser = async (req, res, next) => {
  try {
    const donations = await Donation.find({ donorId: req.user.userId }).sort({ createdAt: -1 });
    return res.json({ donations: donations.map(donationToClient) });
  } catch (err) { next(err); }
};

/* ---------------- GET DONATION RECEIPT ---------------- */
export const getDonationReceipt = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donorId", "firstName lastName email")
      .populate("campaignId", "title");

    if (!donation) return res.status(404).json({ message: "Donation not found" });

    if (req.user.role !== "ADMIN" && donation.donorId._id.toString() !== req.user.userId) {
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
  } catch (err) { next(err); }
};

/* ---------------- LIST DONATIONS (ADMIN) ---------------- */
export const listDonations = async (req, res, next) => {
  try {
    const q = {};
    if (req.query.status) q.status = req.query.status;
    if (req.query.paymentMethod) q.paymentMethod = req.query.paymentMethod.toLowerCase();
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
  } catch (err) { next(err); }
};

/* ---------------- GET DONATION STATUS ---------------- */
export const getDonationStatus = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    const payment = await Payment.findOne({ donationId: donation._id });

    res.json({
      donationId: donation._id,
      status: donation.status,
      payment: payment ? {
        provider: payment.provider,
        method: payment.method,
        status: payment.status,
        lightning: payment.lightning,
        bitcoin: payment.bitcoin
      } : null
    });
  } catch (err) { next(err); }
};
