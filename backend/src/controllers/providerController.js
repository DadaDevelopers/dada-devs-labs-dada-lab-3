import ProviderVerification from "../models/ProviderVerification.js";
import ProviderInvitation from "../models/ProviderInvitation.js";
import crypto from "crypto";
import { sendEmail } from "../utils/mailer.js";
// Send provider invitation (beneficiary/admin)
export const sendProviderInvite = async (req, res, next) => {
  try {
    const { campaignId, providerEmail, providerName } = req.body;
    if (!campaignId || !providerEmail || !providerName) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days
    const invitation = await ProviderInvitation.create({
      campaignId,
      providerEmail,
      providerName,
      token,
      expiresAt,
      invitedByUserId: req.user._id
    });
    // Send email (stub)
    await sendEmail(providerEmail, "DirectAid: Provider Invitation", `You have been invited to verify a campaign. Accept: https://yourapp.com/provider/invite/accept?token=${token}`);
    res.status(201).json({ message: "Invitation sent", invitationId: invitation._id });
  } catch (err) {
    next(err);
  }
};

// Accept provider invitation (provider onboarding)
export const acceptProviderInvite = async (req, res, next) => {
  try {
    const { token } = req.query;
    const invitation = await ProviderInvitation.findOne({ token, status: "PENDING", expiresAt: { $gt: new Date() } });
    if (!invitation) return res.status(400).json({ message: "Invalid or expired invitation" });
    invitation.status = "ACCEPTED";
    await invitation.save();
    // Onboard provider logic here (stub)
    res.json({ message: "Invitation accepted. Please complete provider onboarding." });
  } catch (err) {
    next(err);
  }
};

// Provider verifies campaign docs
// Provider verifies campaign docs
export const verifyCampaignDocs = async (req, res, next) => {
  try {
    const { campaignId, status, verifiedDocs, notes } = req.body;
    if (!campaignId || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Only provider or admin can verify
    // (Assume req.user.providerId exists for providers, or req.user.role === 'ADMIN')
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });
    let providerId = req.user.providerId;
    if (req.user.role === "ADMIN" && req.body.providerId) {
      providerId = req.body.providerId;
    }
    if (!providerId) return res.status(403).json({ message: "Not allowed" });
    // Create verification record
    const verification = await ProviderVerification.create({
      campaignId,
      providerId,
      verifiedDocs: verifiedDocs || [],
      status,
      notes,
      verifiedBy: req.user._id
    });
    // Update campaign providerVerificationStatus and push record
    campaign.providerVerificationStatus = status;
    if (!campaign.providerVerificationRecords) campaign.providerVerificationRecords = [];
    campaign.providerVerificationRecords.push(verification._id);
    await campaign.save();
    res.json({ message: "Verification recorded", verification });
  } catch (err) {
    next(err);
  }
};
// Public: list verified/active providers (minimal info)
export const listPublicProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find({
      status: "ACTIVE",
      kycStatus: "VERIFIED"
    }).select("_id organizationName organizationType city country");
    res.json({ providers });
  } catch (err) {
    next(err);
  }
};
import Provider from "../models/Provider.js";
import { User } from "../models/User.js";
import Campaign from "../models/Campaign.js";

// --------------------------
// Create provider profile
// --------------------------
export const createProvider = async (req, res, next) => {
  try {
    const {
      businessName,
      email,
      phone,
      organizationType,
      businessRegNumber,
      contactPerson,
      bankAccountName,
      bankAccountNumber,
      bankName,
      lightningPubkey,
      shortDescription,
      licenseDocs
    } = req.body;

    if (!businessName) {
      return res.status(400).json({ message: "Business name is required" });
    }

    const exists = await Provider.findOne({ userId: req.user.userId });
    if (exists) {
      return res.status(409).json({ message: "Provider already exists" });
    }

    const provider = await Provider.create({
      userId: req.user.userId,
      businessName,
      email,
      phone,
      organizationType,
      businessRegNumber,
      contactPerson,
      bankAccountName,
      bankAccountNumber,
      bankName,
      lightningPubkey,
      shortDescription,
      licenseDocs
    });

    res.status(201).json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Get logged-in provider
// --------------------------
export const getProviderByUser = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.userId })
      .populate("campaigns", "title status");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Update provider profile
// --------------------------
export const updateProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    const {
      businessName,
      email,
      phone,
      organizationType,
      businessRegNumber,
      contactPerson,
      bankAccountName,
      bankAccountNumber,
      bankName,
      lightningPubkey,
      shortDescription,
      licenseDocs
    } = req.body;

    if (businessName) provider.businessName = businessName;
    if (email) provider.email = email;
    if (phone) provider.phone = phone;
    if (organizationType) provider.organizationType = organizationType;
    if (businessRegNumber) provider.businessRegNumber = businessRegNumber;
    if (contactPerson) provider.contactPerson = contactPerson;
    if (bankAccountName) provider.bankAccountName = bankAccountName;
    if (bankAccountNumber) provider.bankAccountNumber = bankAccountNumber;
    if (bankName) provider.bankName = bankName;
    if (lightningPubkey) provider.lightningPubkey = lightningPubkey;
    if (shortDescription) provider.shortDescription = shortDescription;
    if (licenseDocs) provider.licenseDocs = licenseDocs;

    await provider.save();

    res.json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Add payout method
// --------------------------
export const addPayoutMethod = async (req, res, next) => {
  try {
    const { method, mpesaPhone, bankName, accountName, accountNumber } = req.body;

    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (method === "MPESA" && !mpesaPhone) {
      return res.status(400).json({ message: "Mpesa phone required" });
    }

    provider.payoutMethods.push({
      method,
      mpesaPhone,
      bankName,
      accountName,
      accountNumber
    });

    await provider.save();

    res.json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Request payout (mock)
// --------------------------
export const requestPayout = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (provider.kycStatus !== "APPROVED") {
      return res.status(403).json({ message: "KYC not approved" });
    }

    res.json({
      message: "Payout request received",
      payout: {
        amount,
        currency,
        status: "PENDING",
        reference: `PAYOUT-${Date.now()}`
      }
    });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Admin: list providers
// --------------------------
export const listProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find()
      .populate("userId", "firstName lastName email");

    res.json({
      providers: providers.map(p => p.toClient())
    });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Admin: get provider by ID
// --------------------------
export const getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate("userId", "firstName lastName email")
      .populate("campaigns", "title status");

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Admin: approve / reject KYC
// --------------------------
export const approveKYC = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid KYC status" });
    }

    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    provider.kycStatus = status;
    provider.kycNotes = notes || "";
    provider.approvedBy = req.user.userId;

    await provider.save();

    res.json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Admin: delete provider
// --------------------------
export const deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.json({ message: "Provider deleted" });
  } catch (err) {
    next(err);
  }
};
