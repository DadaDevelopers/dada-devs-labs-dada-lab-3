import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import { logActivity } from "../utils/activityLogger.js";

import CampaignReport from "../models/CampaignReport.js";
import Disbursement from "../models/Disbursement.js";

// formatCampaign (keeps Decimal128 -> number)
function formatCampaign(c) {
  if (!c) return c;

  const obj = c.toObject ? c.toObject({ getters: true, virtuals: true }) : c;

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

    const { metadata } = req.body;

    const campaign = await Campaign.create({
      title,
      description: description || "",
      targetAmount: targetDec,
      currency,
      providerId: providerId || null,
      category: category || null,
      metadata: metadata || {},
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

/* PROVIDER CAMPAIGN CONFIRMATION */
export const confirmProvider = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) return res.status(404).json({ message: "Not found" });

  if (req.user.role !== "PROVIDER")
    return res.status(403).json({ message: "Only providers" });

  campaign.confirmationStatus = "provider_confirmed";
  campaign.providerConfirmedAt = new Date();
  await campaign.save();

  await logActivity({
    actorId: req.user.userId,
    actorRole: "PROVIDER",
    actionType: "PROVIDER_CONFIRMED_CAMPAIGN",
    entityType: "Campaign",
    entityId: campaign._id,
    req
  });

  res.json({ campaign });
};


/**
 * Get All Campaigns - add simple filters/pagination (includes beneficiaryId, confirmationStatus)
 */
export const getAllCampaigns = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      adminStatus,
      category,
      beneficiaryId,
      confirmationStatus
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
    if (beneficiaryId) filter.beneficiaryId = beneficiaryId;
    if (confirmationStatus) filter.confirmationStatus = confirmationStatus;

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
 * Get authenticated beneficiary's campaigns (GET /api/campaigns/me)
 */
export const getMyCampaigns = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, confirmationStatus } = req.query;
    const filter = { beneficiaryId: req.user.userId };
    if (status) filter.status = status;
    if (confirmationStatus) filter.confirmationStatus = confirmationStatus;
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

    const formatted = campaigns.map((c) => formatCampaign(c));

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      campaigns: formatted
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

/*Admin disburses funds*/
export const disburseCampaignFunds = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }

  const { amount, paymentMethod, transactionRef, notes } = req.body;

  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }

  if (campaign.status !== "approved") {
    return res.status(400).json({ message: "Campaign not approved" });
  }

  const disbursement = await Disbursement.create({
    campaignId: campaign._id,
    beneficiaryId: campaign.beneficiaryId,
    amount,
    currency: campaign.currency,
    status: "completed",
    paymentMethod,
    transactionRef,
    disbursedAt: new Date(),
    notes
  });

  campaign.disbursementStatus = "completed";
  campaign.disbursedAt = new Date();
  await campaign.save();

  await logActivity({
    actorId: req.user.userId,
    actorRole: "ADMIN",
    actionType: "ADMIN_DISBURSED_CAMPAIGN_FUNDS",
    entityType: "Campaign",
    entityId: campaign._id,
    metadata: { amount, paymentMethod },
    req
  });

  res.status(201).json({ disbursement });
};

/*Beneficiary views campaigndisbursement*/
export const getCampaignDisbursement = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }

  const allowed =
    req.user.role === "ADMIN" ||
    String(campaign.beneficiaryId) === req.user.userId;

  if (!allowed) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const disbursement = await Disbursement.findOne({
    campaignId: campaign._id
  });

  res.json({ disbursement });
};

/*Submit campaign report*/
export const submitCampaignReport = async (req, res) => {
  const { description, reportType, uploadIds = [] } = req.body;

  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }

  // Only campaign owner
  if (
    req.user.role !== "BENEFICIARY" ||
    String(campaign.beneficiaryId) !== req.user.userId
  ) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const report = await CampaignReport.create({
    campaignId: campaign._id,
    beneficiaryId: req.user.userId,
    description,
    reportType,
    uploadIds
  });

  await logActivity({
    actorId: req.user.userId,
    actorRole: "BENEFICIARY",
    actionType: "BENEFICIARY_SUBMITTED_CAMPAIGN_REPORT",
    entityType: "Campaign",
    entityId: campaign._id,
    metadata: { reportType },
    req
  });

  res.status(201).json({ report });
};

/*Get campaign reports (admin/beneficiary/provider)*/
export const getCampaignReports = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: "Campaign not found" });
  }

  // Access rules
  const allowed =
    req.user.role === "ADMIN" ||
    String(campaign.beneficiaryId) === req.user.userId ||
    String(campaign.providerId) === req.user.userId;

  if (!allowed) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const reports = await CampaignReport.find({
    campaignId: campaign._id
  }).sort({ createdAt: -1 });

  res.json({ count: reports.length, reports });
};

/*Admin marks report as reviewed (optional but nice)*/
export const reviewCampaignReport = async (req, res) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin only" });
  }

  const report = await CampaignReport.findById(req.params.reportId);
  if (!report) {
    return res.status(404).json({ message: "Report not found" });
  }

  report.status = "reviewed";
  await report.save();

  await logActivity({
    actorId: req.user.userId,
    actorRole: "ADMIN",
    actionType: "ADMIN_REVIEWED_CAMPAIGN_REPORT",
    entityType: "Campaign",
    entityId: report.campaignId,
    metadata: { reportId: report._id },
    req
  });

  res.json({ report });
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
