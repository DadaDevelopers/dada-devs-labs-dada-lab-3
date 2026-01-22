import Provider from "../models/Provider.js";
import Allocation from "../models/Allocation.js";
import Withdrawal from "../models/Withdrawal.js";

export const getProviderStats = async (req, res) => {
  try {
    const providerId = req.user._id;
    const totalReceivedSats = await Allocation.aggregate([
      { $match: { provider: providerId } },
      { $group: { _id: null, total: { $sum: "$amountSats" } } }
    ]);
    const totalWithdrawnSats = await Withdrawal.aggregate([
      { $match: { provider: providerId, status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amountSats" } } }
    ]);
    const availableBalanceSats =
      (totalReceivedSats[0]?.total || 0) - (totalWithdrawnSats[0]?.total || 0);
    const activeCampaigns = await Allocation.distinct("campaign", {
      provider: providerId,
      status: "ACTIVE",
    });
    // Get verification status from provider profile
    const provider = await Provider.findById(providerId).select("kyc.status");
    res.json({
      totalReceivedSats: totalReceivedSats[0]?.total || 0,
      totalWithdrawnSats: totalWithdrawnSats[0]?.total || 0,
      availableBalanceSats,
      activeCampaigns: activeCampaigns.length,
      verificationStatus: provider?.kyc?.status || "NOT_SET",
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch provider stats", error: err.message });
  }
};
