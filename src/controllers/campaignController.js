import Campaign from "../models/Campaign.js";

// Convert Decimal128 values for frontend usability
function formatCampaign(c) {
  if (!c) return c;

  const obj = c.toObject({ getters: true, virtuals: false });

  if (obj.targetAmount) {
    obj.targetAmount = parseFloat(obj.targetAmount.toString());
  }
  if (obj.amountRaised) {
    obj.amountRaised = parseFloat(obj.amountRaised.toString());
  }

  return obj;
}

// -----------------------------------------
// Create Campaign (Beneficiary only)
// -----------------------------------------
export const createCampaign = async (req, res, next) => {
  try {
    const { title, description, targetAmount, currency, providerId } = req.body;

    const campaign = await Campaign.create({
      title,
      description,
      targetAmount,
      currency,
      providerId: providerId || null,
      beneficiaryId: req.user.userId // logged-in beneficiary
    });

    res.status(201).json({ campaign: formatCampaign(campaign) });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------
// Get All Campaigns
// -----------------------------------------
export const getAllCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find()
      .populate("beneficiaryId", "firstName lastName email")
      .populate("providerId", "businessName mpesaPhone");

    res.json({
      campaigns: campaigns.map(c => formatCampaign(c))
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------
// Get Campaign By ID
// -----------------------------------------
export const getCampaignById = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate("beneficiaryId", "firstName lastName email")
      .populate("providerId", "businessName mpesaPhone");

    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    res.json({ campaign: formatCampaign(campaign) });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------
// Update Campaign (Only Beneficiary or Admin)
// -----------------------------------------
export const updateCampaign = async (req, res, next) => {
  try {
    const { title, description, targetAmount, currency, providerId, status } =
      req.body;

    const campaign = await Campaign.findById(req.params.id);

    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    // Permission check
    if (
      campaign.beneficiaryId.toString() !== req.user.userId &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (targetAmount) campaign.targetAmount = targetAmount;
    if (currency) campaign.currency = currency;
    if (providerId) campaign.providerId = providerId;
    if (status) campaign.status = status;

    await campaign.save();

    res.json({ campaign: formatCampaign(campaign) });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------
// Delete Campaign (Only Beneficiary or Admin)
// -----------------------------------------
export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign)
      return res.status(404).json({ message: "Campaign not found" });

    if (
      campaign.beneficiaryId.toString() !== req.user.userId &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await campaign.deleteOne();

    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    next(err);
  }
};
