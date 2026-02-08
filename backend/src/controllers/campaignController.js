// src/controllers/campaignControllers.js

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
 * Link provider to campaign
 */
export const linkProviderToCampaign = async (req, res, next) => {
  try {
    const { providerId } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ message: "providerId is required" });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Check permissions
    const isOwner = campaign.beneficiaryId.toString() === req.user.userId;
    const isAdmin = req.user.role === "ADMIN";
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to link provider" });
    }

    // IMPORTANT: Get the User ID from the Provider
    // We need to find the user associated with this provider
    const Provider = mongoose.model('Provider');
    const provider = await Provider.findById(providerId);
    
    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    // Save the USER ID, not the Provider ID
    campaign.providerId = provider.userId;  // This is the key fix!
    await campaign.save();

    // Log activity
    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "LINK_PROVIDER_TO_CAMPAIGN",
      entityType: "Campaign",
      entityId: campaign._id,
      description: `Provider linked to campaign: ${campaign.title}`,
      metadata: { providerId, userId: provider.userId },
      req
    });

    // Populate for response
    const populatedCampaign = await Campaign.findById(campaign._id)
      .populate("beneficiaryId", "firstName lastName email")
      .populate("providerId", "firstName lastName email");

    res.json({ 
      message: "Provider linked successfully",
      campaign: formatCampaign(populatedCampaign)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Provider accepts a campaign
 */
export const providerAcceptCampaign = async (req, res, next) => {
  try {
    const { notes } = req.body;
    
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Check if this USER is the provider linked to the campaign
    if (!campaign.providerId || campaign.providerId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: "Not authorized. This campaign is not linked to your provider account." 
      });
    }

    // Update provider acceptance
    campaign.providerAccepted = true;
    campaign.providerAcceptedAt = new Date();
    campaign.providerNotes = notes || "";
    await campaign.save();

    // Log activity
    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "PROVIDER_ACCEPT_CAMPAIGN",
      entityType: "Campaign",
      entityId: campaign._id,
      description: `Provider accepted campaign: ${campaign.title}`,
      metadata: { notes },
      req
    });

    res.json({ 
      message: "Campaign accepted successfully",
      campaign: formatCampaign(campaign)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Submit campaign for review (after provider accepts)
 */
export const submitCampaignForReview = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Check permissions: beneficiary or provider who accepted it
    const isBeneficiary = campaign.beneficiaryId.toString() === req.user.userId;
    const isProvider = campaign.providerId && campaign.providerId.toString() === req.user.userId;
    
    if (!isBeneficiary && !isProvider) {
      return res.status(403).json({ 
        message: "Not authorized to submit this campaign for review" 
      });
    }

    // Check if provider has accepted
    if (!campaign.providerAccepted) {
      return res.status(400).json({ 
        message: "Provider must accept the campaign before submission" 
      });
    }

    // Submit for admin review
    campaign.submittedForReview = true;
    campaign.submittedAt = new Date();
    campaign.adminStatus = "pending"; // Reset admin status
    await campaign.save();

    // Log activity
    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "SUBMIT_CAMPAIGN_FOR_REVIEW",
      entityType: "Campaign",
      entityId: campaign._id,
      description: `Campaign submitted for admin review: ${campaign.title}`,
      metadata: {},
      req
    });

    res.json({ 
      message: "Campaign submitted for admin review successfully",
      campaign: formatCampaign(campaign)
    });
  } catch (err) {
    next(err);
  }
};

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
        .populate("providerId", "businessName email phone")
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
