// src/controllers/providerController.js
import Provider from "../models/Provider.js";
import { User } from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Withdrawal from "../models/Withdrawal.js";
import Disbursement from "../models/Disbursement.js";
import { payToLightningAddress, isPayConfigured } from "../services/lightning.service.js";
import { logActivity } from "../utils/activityLogger.js";

// --------------------------
// Create provider profile
// --------------------------
export const createProvider = async (req, res, next) => {
  try {
    const { businessName, email, phone } = req.body;

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
      phone
    });

    res.status(201).json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Get logged-in provider (auto-create if missing so first load never 404s)
// --------------------------
export const getProviderByUser = async (req, res, next) => {
  try {
    let provider = await Provider.findOne({ userId: req.user.userId })
      .populate("campaigns", "title status");

    if (!provider) {
      const user = await User.findById(req.user.userId)
        .select("email phoneNumber organization");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      provider = await Provider.create({
        userId: req.user.userId,
        businessName: user.organization || "My Organization",
        email: user.email || undefined,
        phone: user.phoneNumber || undefined
      });
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

    const { businessName, email, phone } = req.body;

    if (businessName) provider.businessName = businessName;
    if (email) provider.email = email;
    if (phone) provider.phone = phone;

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
    const { method, lightningAddress, btcAddress } = req.body;

    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    if (method === "LIGHTNING" && !lightningAddress?.trim()) {
      return res.status(400).json({ message: "Lightning address required" });
    }
    if (method === "BITCOIN" && !btcAddress?.trim()) {
      return res.status(400).json({ message: "BTC address required" });
    }
    if (!["LIGHTNING", "BITCOIN"].includes(method)) {
      return res.status(400).json({ message: "Method must be LIGHTNING or BITCOIN" });
    }

    provider.payoutMethods.push({
      method,
      lightningAddress: method === "LIGHTNING" ? lightningAddress?.trim() : undefined,
      btcAddress: method === "BITCOIN" ? btcAddress?.trim() : undefined
    });

    await provider.save();

    res.json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Request payout (persists Withdrawal for campaign transparency)
// --------------------------
export const requestPayout = async (req, res, next) => {
  try {
    const { amount, currency, campaignId } = req.body;

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

    const reference = `PAYOUT-${Date.now()}`;
    let withdrawal = null;
    if (campaignId) {
      withdrawal = await Withdrawal.create({
        campaignId,
        providerId: provider._id,
        amount,
        currency: currency || "USD",
        status: "PENDING",
        reference,
      });
    }

    res.json({
      message: "Payout request received",
      payout: {
        amount,
        currency: currency || "USD",
        status: "PENDING",
        reference,
        withdrawalId: withdrawal?._id,
      },
      withdrawal: withdrawal ? withdrawal.toClient() : undefined,
    });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Public: list registered and approved providers (landing page + beneficiary campaign creation)
// --------------------------
export const listPublicProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find({ kycStatus: "APPROVED" })
      .populate("userId", "city country organization providerProfile");

    const list = providers.map((p) => {
      const u = p.userId || {};
      const pp = u.providerProfile || {};
      return {
        id: p._id.toString(),
        organizationName: p.businessName || u.organization || "Provider",
        organizationType: pp.organizationType || "other",
        city: u.city || "",
        country: u.country || ""
      };
    });

    res.json({ providers: list });
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

// --------------------------
// Admin: list pending withdrawals (for payout processing)
// --------------------------
export const listWithdrawals = async (req, res, next) => {
  try {
    const status = req.query.status || "PENDING";
    const withdrawals = await Withdrawal.find({ status })
      .populate("campaignId", "title amountRaised currency beneficiaryId")
      .populate("providerId");
    const list = withdrawals.map((w) => {
      const client = w.toClient();
      const provider = w.providerId;
      const lightning = (provider?.payoutMethods || []).find((pm) => pm.method === "LIGHTNING");
      return {
        ...client,
        lightningAddress: lightning?.lightningAddress || null,
      };
    });
    res.json({ withdrawals: list });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Admin: send withdrawal to provider via Lightning (mark COMPLETED, create Disbursement)
// --------------------------
export const sendWithdrawalLightning = async (req, res, next) => {
  try {
    if (!isPayConfigured()) {
      return res.status(503).json({
        message: "Lightning pay is not configured. In the backend .env set LNBITS_URL (e.g. https://your-lnbits.com) and LNBITS_ADMIN_KEY (admin key of the wallet used to send payouts).",
      });
    }

    const withdrawal = await Withdrawal.findById(req.params.id)
      .populate("campaignId")
      .populate("providerId");
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }
    if (withdrawal.status !== "PENDING") {
      return res.status(400).json({ message: "Withdrawal is not PENDING" });
    }

    const provider = withdrawal.providerId;
    if (!provider) {
      return res.status(400).json({ message: "Provider not found" });
    }
    const lightning = (provider.payoutMethods || []).find((pm) => pm.method === "LIGHTNING");
    const lightningAddress = lightning?.lightningAddress;
    if (!lightningAddress?.trim()) {
      return res.status(400).json({
        message: "Provider has no Lightning payout method. Ask provider to add a Lightning address in Settings → Payouts.",
      });
    }

    const amountFiat = parseFloat(String(withdrawal.amount));
    const currency = (withdrawal.currency || "USD").toUpperCase();
    const satsPerUnit = Number(process.env.USD_TO_SATS) || 2500;
    const amountSats = Math.round(amountFiat * satsPerUnit);
    if (amountSats < 1) {
      return res.status(400).json({ message: "Amount too small to convert to sats (min 1 sat). Check USD_TO_SATS or amount." });
    }

    await payToLightningAddress(lightningAddress.trim(), amountSats);

    withdrawal.status = "COMPLETED";
    await withdrawal.save();

    const campaign = withdrawal.campaignId;
    if (!campaign) {
      return res.status(400).json({ message: "Campaign not found" });
    }
    const disbursement = await Disbursement.create({
      campaignId: campaign._id,
      beneficiaryId: campaign.beneficiaryId,
      providerId: provider._id,
      amount: amountFiat,
      currency: withdrawal.currency || "USD",
      status: "completed",
      paymentMethod: "LIGHTNING",
      transactionRef: `LN-${withdrawal.reference || withdrawal._id}`,
      disbursedAt: new Date(),
      notes: `Paid to ${lightningAddress} (${amountSats} sats)`,
    });

    if (campaign.disbursementStatus !== "completed") {
      campaign.disbursementStatus = "completed";
      campaign.disbursedAt = new Date();
      await campaign.save();
    }

    await logActivity({
      actorId: req.user.userId,
      actorRole: "ADMIN",
      actionType: "ADMIN_SENT_WITHDRAWAL_LIGHTNING",
      entityType: "Withdrawal",
      entityId: withdrawal._id,
      metadata: { amountSats, lightningAddress: lightningAddress.substring(0, 20) + "...", disbursementId: disbursement._id },
      req,
    });

    res.json({
      message: "Payment sent via Lightning",
      withdrawal: withdrawal.toClient(),
      disbursement: { _id: disbursement._id, amount: amountFiat, currency: disbursement.currency, status: disbursement.status },
    });
  } catch (err) {
    next(err);
  }
};
