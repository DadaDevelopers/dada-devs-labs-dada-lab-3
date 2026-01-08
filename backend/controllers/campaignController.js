import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import { logActivity } from "../utils/activityLogger.js";

// formatCampaign (keeps Decimal128 -> number)
function formatCampaign(c) {
  if (!c) return c;

  const obj = c.toObject({ getters: true, virtuals: true });

  if (obj.targetAmount) obj.targetAmount = parseFloat(obj.targetAmount.toString());
  if (obj.amountRaised) obj.amountRaised = parseFloat(obj.amountRaised.toString());

  return obj;
}

/**
 * Create Campaign (BENEFICIARY only)
 */
export const createCampaign = async (req, res, next) => {
  try {
    const { title, description, targetAmount, currency, providerId, category } = req.body;

    if (!title || !targetAmount || !currency) {
      return res.status(400).json({ message: "title, targetAmount and currency are required" });
    }

    // convert targetAmount to Decimal128 safely
    const targetDec = mongoose.Types.Decimal128.fromString(String(targetAmount));

    const campaign = await Campaign.create({
      title,
      description: description || "",
      targetAmount: targetDec,
      currency,
      providerId: providerId || null,
      category: category || null,
      beneficiaryId: req.user.userId // logged-in beneficiary
    });

    // Log creation
    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "CREATE_CAMPAIGN",
      entityType: "Campaign",
      entityId: campaign._id,
      description: `Campaign created: ${campaign.title}`,
      metadata: { publicId: campaign.publicId },
      req
    });

    res.status(201).json({ campaign: formatCampaign(campaign) });
  } catch (err) {
    next(err);
  }
};

/**
 * Get All Campaigns - add simple filters/pagination
 */
export const getAllCampaigns = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      adminStatus,
      category
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (status) filter.status = status;
    if (adminStatus) filter.adminStatus = adminStatus;
    if (category) filter.category = category;

    const skip = (Number(page) - 1) * Number(limit);

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate("beneficiaryId", "firstName lastName email")
        .populate("providerId", "firstName lastName organization phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Campaign.countDocuments(filter)
    ]);

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      campaigns: campaigns.map(formatCampaign)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get Campaign By ID - accept either _id or publicId via ?by=public
 */
export const getCampaignById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const byPublic = req.query.by === "public";

    const query = byPublic ? { publicId: id } : { _id: id };

    const campaign = await Campaign.findOne(query)
      .populate("beneficiaryId", "firstName lastName email")
      .populate("providerId", "firstName lastName organization phoneNumber");

    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    res.json({ campaign: formatCampaign(campaign) });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Campaign - owner or admin
 */
export const updateCampaign = async (req, res, next) => {
  try {
    const { title, description, targetAmount, currency, providerId, status, category } = req.body;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    // Permission check
    if (campaign.beneficiaryId.toString() !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (title !== undefined) campaign.title = title;
    if (description !== undefined) campaign.description = description;
    if (targetAmount !== undefined) campaign.targetAmount = mongoose.Types.Decimal128.fromString(String(targetAmount));
    if (currency !== undefined) campaign.currency = currency;
    if (providerId !== undefined) campaign.providerId = providerId;
    if (status !== undefined) campaign.status = status;
    if (category !== undefined) campaign.category = category;

    await campaign.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "UPDATE_CAMPAIGN",
      entityType: "Campaign",
      entityId: campaign._id,
      description: `Campaign updated: ${campaign.title}`,
      metadata: { changes: req.body },
      req
    });

    res.json({ campaign: formatCampaign(campaign) });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: update campaign admin status
 */
export const adminUpdateCampaignStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ["approved", "rejected", "flagged", "pending"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const campaign = await Campaign.findById(req.params.id)
      .populate("beneficiaryId", "firstName lastName email")
      .populate("providerId", "firstName lastName organization phoneNumber");

    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const oldStatus = campaign.adminStatus;
    campaign.adminStatus = status;
    await campaign.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: `ADMIN_${status.toUpperCase()}_CAMPAIGN`,
      entityType: "Campaign",
      entityId: campaign._id,
      description: `Campaign adminStatus changed from ${oldStatus} to ${status} by admin`,
      metadata: { oldStatus, newStatus: status },
      req
    });

    res.json({ campaign: formatCampaign(campaign) });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete Campaign (owner or admin)
 */
export const deleteCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    if (campaign.beneficiaryId.toString() !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not allowed" });
    }

    await campaign.deleteOne();

    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "DELETE_CAMPAIGN",
      entityType: "Campaign",
      entityId: campaign._id,
      description: `Campaign deleted: ${campaign.title}`,
      metadata: {},
      req
    });

    res.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    next(err);
  }
};
