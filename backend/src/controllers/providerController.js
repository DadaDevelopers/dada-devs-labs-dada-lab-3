// src/controllers/providerController.js
import Provider from "../models/Provider.js";
import { User } from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Withdrawal from "../models/Withdrawal.js";

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
// Public: list providers for beneficiary campaign creation (select provider dropdown)
// --------------------------
export const listPublicProviders = async (req, res, next) => {
  try {
    const providers = await Provider.find()
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
