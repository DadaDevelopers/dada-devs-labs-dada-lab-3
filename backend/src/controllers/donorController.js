import Donor from "../models/Donor.js";
import DonationM from "../models/DonorDonation.js"; // the donations model
import Campaign from "../models/Campaign.js";
import crypto from "crypto";
import mongoose from "mongoose";


/* --------------------------
   Create donor profile
-------------------------- */
export const createDonor = async (req, res, next) => {
  try {
    const exists = await Donor.findOne({ userId: req.user.userId });
    if (exists) {
      return res.status(409).json({ message: "Donor already exists" });
    }

    const { displayName, email, phone, country } = req.body;

    const donor = await Donor.create({
      userId: req.user.userId,
      displayName,
      email,
      phone,
      country
    });

    res.status(201).json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Get my donor profile
-------------------------- */
export const getMyDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.userId })
      .populate("donations");

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Update donor profile
-------------------------- */
export const updateDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const {
      displayName,
      phone,
      country,
      anonymousByDefault,
      receiveUpdates,
      receiveReceipts
    } = req.body;

    if (displayName !== undefined) donor.displayName = displayName;
    if (phone !== undefined) donor.phone = phone;
    if (country !== undefined) donor.country = country;
    if (anonymousByDefault !== undefined) donor.anonymousByDefault = anonymousByDefault;
    if (receiveUpdates !== undefined) donor.receiveUpdates = receiveUpdates;
    if (receiveReceipts !== undefined) donor.receiveReceipts = receiveReceipts;

    await donor.save();

    res.json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Add payment method
-------------------------- */
export const addPaymentMethod = async (req, res, next) => {
  try {
    const { method, mpesaPhone, lightningPubKey, bitcoinAddress } = req.body;

    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    // Validate based on selected method
    switch (method) {
      case "MPESA":
        if (!mpesaPhone) return res.status(400).json({ message: "MPESA phone required" });
        break;
      case "LIGHTNING":
        if (!lightningPubKey) return res.status(400).json({ message: "Lightning invoice/public key required" });
        break;
      case "BITCOIN":
        if (!bitcoinAddress) return res.status(400).json({ message: "Bitcoin address required" });
        break;
      default:
        return res.status(400).json({ message: "Invalid payment method" });
    }

    // Save new payment method
    donor.paymentMethods.push({
      method,
      mpesaPhone,
      lightningPubKey,
      bitcoinAddress
    });

    await donor.save();

    res.status(200).json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};


/* --------------------------
   Admin: list donors
-------------------------- */
export const listDonors = async (req, res, next) => {
  try {
    const donors = await Donor.find()
      .populate("userId", "firstName lastName email");

    res.json({ donors: donors.map(d => d.toClient()) });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Admin: get donor by id
-------------------------- */
export const getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id)
      .populate("userId", "firstName lastName email")
      .populate("donations");

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Admin: delete donor
-------------------------- */
export const deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({ message: "Donor deleted" });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Donor: create donation
-------------------------- */
const initiateMpesaStk = async ({ phone, amount }) => {
  return {
    checkoutRequestId: "ws_CO_" + crypto.randomBytes(6).toString("hex")
  };
};

// Campaign resolver
const resolveCampaign = async (campaignId) => {
  let campaign = null;

  if (mongoose.Types.ObjectId.isValid(campaignId)) {
    campaign = await Campaign.findById(campaignId);
    if (campaign) return campaign;
  }

  campaign = await Campaign.findOne({ publicId: campaignId });
  if (campaign) return campaign;

  campaign = await Campaign.findOne({ uuid: campaignId });
  if (campaign) return campaign;

  return null;
};

export const createDonation = async (req, res, next) => {
  try {
    const {
      amount,
      paymentMethod,
      campaignId,
      phone,
      donorName,
      donorEmail,
      lightningInvoice,
      bitcoinAddress
    } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Amount is required" });

    if (!paymentMethod)
      return res.status(400).json({ message: "Payment method required" });

    if (!campaignId)
      return res.status(400).json({ message: "Campaign ID required" });

    if (!donorName)
      return res.status(400).json({ message: "Donor name required" });

    if (!donorEmail)
      return res.status(400).json({ message: "Donor email required" });

    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) return res.status(404).json({ message: "Donor not found" });

    const campaign = await resolveCampaign(campaignId);
    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    let mpesaCheckoutId = null;

    switch (paymentMethod) {
      case "LIGHTNING":
        if (!lightningInvoice)
          return res.status(400).json({ message: "Lightning invoice required" });
        break;

      case "BITCOIN":
        if (!bitcoinAddress)
          return res.status(400).json({ message: "Bitcoin address required" });
        break;

      case "MPESA":
        if (!phone)
          return res.status(400).json({ message: "Phone required for MPESA" });
        const mpesaRes = await initiateMpesaStk({ phone, amount });
        mpesaCheckoutId = mpesaRes.checkoutRequestId;
        break;

      default:
        return res.status(400).json({ message: "Invalid payment method" });
    }

    const donation = await DonationM.create({
      donor: donor._id,
      campaign: campaign._id,
      donorName,
      donorEmail,
      paymentMethod,
      amount,
      currency: "USD",
      lightningInvoice: lightningInvoice || null,
      bitcoinAddress: bitcoinAddress || null,
      checkoutId: mpesaCheckoutId,
      status: "PENDING"
    });

    res.status(201).json({
      donationId: donation._id,
      donorName,
      donorEmail,
      paymentMethod,
      amount,
      currency: "USD",
      lightningInvoice,
      bitcoinAddress,
      mpesaCheckoutId
    });
  } catch (err) {
    next(err);
  }
};

