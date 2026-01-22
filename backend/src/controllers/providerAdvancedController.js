import Provider from "../models/Provider.js";
import Campaign from "../models/Campaign.js";
import LedgerEntry from "../models/LedgerEntry.js";

// List all campaigns for the logged-in provider
export const listProviderCampaigns = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    const campaigns = await Campaign.find({ _id: { $in: provider.campaigns } });
    res.json({ campaigns });
  } catch (err) {
    next(err);
  }
};

// Get provider wallet/balance and recent transactions
export const getProviderWallet = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    // Calculate balance from ledger entries
    const ledgerEntries = await LedgerEntry.find({
      account: "PROVIDER_BALANCE",
      "metadata.providerId": provider._id
    }).sort({ createdAt: -1 }).limit(20);
    let balance = 0;
    for (const entry of ledgerEntries) {
      balance += parseFloat(entry.debit || 0) - parseFloat(entry.credit || 0);
    }
    res.json({ balance, recentTransactions: ledgerEntries });
  } catch (err) {
    next(err);
  }
};

// Update a payout method
export const updatePayoutMethod = async (req, res, next) => {
  try {
    const { payoutMethodId } = req.params;
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    const method = provider.payoutMethods.id(payoutMethodId);
    if (!method) {
      return res.status(404).json({ message: "Payout method not found" });
    }
    Object.assign(method, req.body);
    await provider.save();
    res.json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};

// Delete a payout method
export const deletePayoutMethod = async (req, res, next) => {
  try {
    const { payoutMethodId } = req.params;
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }
    const method = provider.payoutMethods.id(payoutMethodId);
    if (!method) {
      return res.status(404).json({ message: "Payout method not found" });
    }
    method.remove();
    await provider.save();
    res.json({ provider: provider.toClient() });
  } catch (err) {
    next(err);
  }
};
