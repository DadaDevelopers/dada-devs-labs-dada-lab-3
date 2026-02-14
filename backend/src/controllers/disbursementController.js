import Disbursement from "../models/Disbursement.js";
import Campaign from "../models/Campaign.js";

export const getMyDisbursements = async (req, res) => {
  try {
    const beneficiaryId = req.user._id;
    const { campaignId, status, page = 1, limit = 20 } = req.query;
    const query = { beneficiaryId };
    if (campaignId) query.campaignId = campaignId;
    if (status) query.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Disbursement.countDocuments(query);
    const disbursements = await Disbursement.find(query)
      .populate({ path: "campaignId", select: "_id title" })
      .sort({ disbursedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      disbursements: disbursements.map(d => ({
        id: d._id,
        campaignId: d.campaignId?._id,
        campaign: d.campaignId ? { id: d.campaignId._id, title: d.campaignId.title } : undefined,
        amount: d.amount,
        currency: d.currency,
        status: d.status,
        disbursedAt: d.disbursedAt,
        description: d.description,
        transactionRef: d.transactionRef,
        paymentMethod: d.paymentMethod
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch disbursements", error: err.message });
  }
};

export const createDisbursement = async (req, res) => {
  try {
    const campaignId = req.params.id;
    const beneficiaryId = req.user._id;
    const { amount, note } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount is required and must be positive." });
    }
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }
    // Optionally check if beneficiary matches campaign.beneficiaryId
    if (!campaign.beneficiaryId.equals(beneficiaryId)) {
      return res.status(403).json({ message: "Not allowed. You are not the beneficiary for this campaign." });
    }
    // Create disbursement request
    const disbursement = await Disbursement.create({
      campaignId,
      beneficiaryId,
      amount,
      currency: campaign.currency,
      status: "REQUESTED",
      description: note || "",
      requestedAt: new Date()
    });
    res.status(201).json({ message: "Disbursement request submitted.", disbursement });
  } catch (err) {
    res.status(500).json({ message: "Failed to create disbursement", error: err.message });
  }
};
