import Provider from "../models/Provider.js";
import { User } from "../models/User.js";

// Create a new provider profile
export const createProvider = async (req, res, next) => {
  try {
    const { businessName, mpesaPhone, payoutInstructions, email, phone } = req.body;

    if (!businessName || !mpesaPhone) {
      return res.status(400).json({ message: "Business name  and M-Pesa phone are required" });
    }

    // Check if user already has a provider profile
    const existing = await Provider.findOne({ userId: req.user.userId });
    if (existing) {
      return res.status(409).json({ message: "Provider profile already exists" });
    }

    const provider = await Provider.create({
      userId: req.user.userId,
      businessName,
      mpesaPhone,
      payoutInstructions,
      email,
      phone,
      campaigns: []
    });

    res.status(201).json({ provider: provider.toClient });
  } catch (err) {
    next(err);
  }
};

// Get provider profile by logged-in user
export const getProviderByUser = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.userId }).populate("userId", "-passwordHash");
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    res.json({ provider });
  } catch (err) {
    next(err);
  }
};

// Update provider profile
export const updateProvider = async (req, res, next) => {
  try {
    const { businessName, mpesaPhone, payoutInstructions, email, phone } = req.body;

    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    if (businessName) provider.businessName = businessName;
    if (mpesaPhone) provider.mpesaPhone = mpesaPhone;
    if (payoutInstructions) provider.payoutInstructions = payoutInstructions;
    if (email) provider.email = email;
    if (phone) provider.phone = phone;

    await provider.save();
    res.json({ provider });
  } catch (err) {
    next(err);
  }
};

// --------------------------
// Admin / public access
// --------------------------

// Get provider profile by provider ID (_id)
export const getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id)
      .populate("userId", "-passwordHash");
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    res.json({ provider });
  } catch (err) {
    next(err);
  }
};

// List/get all providers (optionally filter by KYC)
export const listProviders = async (req, res, next) => {
  try {
    const { kycStatus } = req.query;
    const filter = {};
    if (kycStatus) filter.kycStatus = kycStatus;
    
    const providers = await Provider.find(filter).populate("campaigns");
    res.json({ providers: providers.map(p => p.toClient()) });
  } catch (err) { next(err); }
};

// Admin: Approve or reject KYC
export const approveKYC = async (req, res, next) => {
  try {
    const { status, notes } = req.body; // status = "APPROVED" or "REJECTED"
    if (!["APPROVED","REJECTED"].includes(status)) return res.status(400).json({ message: "Invalid status" });

    const provider = await Provider.findById(req.params.id);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    provider.kycStatus = status;
    provider.kycNotes = notes || "";
    provider.approvedBy = req.user.userId;
    await provider.save();

    res.json({ provider: provider.toClient() });
  } catch (err) { next(err); }
};

// Provider: Add a payout method
export const addPayoutMethod = async (req, res, next) => {
  try {
    const { method, bank, mpesa, crypto, note } = req.body;
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    provider.payoutMethods.push({ method, bank, mpesa, crypto, note });
    await provider.save();
    res.json({ provider: provider.toClient() });
  } catch (err) { next(err); }
};

// Provider: Request a payout (mock example)
export const requestPayout = async (req, res, next) => {
  try {
    const { amount, currency, payoutMethodId } = req.body;
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    const payoutMethod = provider.payoutMethods.id(payoutMethodId);
    if (!payoutMethod || !payoutMethod.active) return res.status(400).json({ message: "Invalid payout method" });

    // TODO: integrate real payout provider here (Mpesa STK, bank API, Stripe, crypto etc.)
    // For now, mock response
    const payoutResponse = {
      status: "PENDING",
      reference: `MOCK-${Date.now()}`,
      amount,
      currency,
      method: payoutMethod.method
    };

    res.json({ message: "Payout request submitted", payout: payoutResponse });
  } catch (err) { next(err); }
};


// Admin: delete provider by ID
export const deleteProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id);
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    res.json({ message: "Provider deleted" });
  } catch (err) {
    next(err);
  }
};
