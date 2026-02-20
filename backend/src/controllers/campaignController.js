// src/controllers/campaignControllers.js

import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import Provider from "../models/Provider.js";
import { logActivity } from "../utils/activityLogger.js";
import CampaignReport from "../models/CampaignReport.js";
import Disbursement from "../models/Disbursement.js";
import Withdrawal from "../models/Withdrawal.js";
import Donation from "../models/Donation.js";

// formatCampaign (keeps Decimal128 -> number)
function formatCampaign(c) {
  if (!c) return c;

  const obj = c.toObject ? c.toObject({ getters: true, virtuals: true }) : c;

  if (obj.targetAmount) obj.targetAmount = parseFloat(obj.targetAmount.toString());
  if (obj.amountRaised) obj.amountRaised = parseFloat(obj.amountRaised.toString());

  // Flatten location for frontend convenience
  if (obj.metadata && obj.metadata.location) {
    obj.location = obj.metadata.location;
  }

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
      .populate("beneficiaryId", "firstName lastName email beneficiaryProfile.displayName")
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
 * Provider accepts a campaign (linked by providerId OR by metadata.manualProvider.email)
 */
export const providerAcceptCampaign = async (req, res, next) => {
  try {
    const { notes } = req.body;
    
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const isLinkedByProviderId = campaign.providerId && campaign.providerId.toString() === req.user.userId;
    const manualEmail = campaign.metadata?.manualProvider?.email?.trim?.();
    const providerDoc = await Provider.findOne({ userId: req.user.userId });
    const myEmail = (providerDoc?.email || req.user.email || "").trim().toLowerCase();
    const isInvitedByEmail = !campaign.providerId && manualEmail && myEmail && manualEmail.toLowerCase() === myEmail;

    if (!isLinkedByProviderId && !isInvitedByEmail) {
      return res.status(403).json({ 
        message: "Not authorized. This campaign is not linked to your provider account." 
      });
    }

    // When accepting as manual-invited provider, set providerId to this user
    if (isInvitedByEmail && !campaign.providerId) {
      campaign.providerId = req.user.userId;
    }

    // Update provider acceptance
    campaign.providerAccepted = true;
    campaign.providerAcceptedAt = new Date();
    campaign.providerNotes = notes || "";

    // If admin has already approved, this acceptance makes the campaign fully active
    if (campaign.adminStatus === "approved" && campaign.status === "PENDING") {
      campaign.status = "ACTIVE";
    }

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

    const { metadata } = req.body;

    // If providerId is sent (Provider document _id), resolve to User id for Campaign.providerId ref
    let resolvedProviderUserId = null;
    if (providerId) {
      const provider = await Provider.findById(providerId);
      if (provider) resolvedProviderUserId = provider.userId;
    }

    const campaign = await Campaign.create({
      title,
      description: description || "",
      targetAmount: targetDec,
      currency,
      providerId: resolvedProviderUserId || null,
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
export const confirmProvider = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "PROVIDER") {
      return res.status(403).json({ message: "Only providers can confirm campaigns" });
    }

    const isLinkedByProviderId = campaign.providerId && campaign.providerId.toString() === req.user.userId;
    const manualEmail = campaign.metadata?.manualProvider?.email?.trim?.();
    const providerDoc = await Provider.findOne({ userId: req.user.userId });
    const myEmail = (providerDoc?.email || req.user.email || "").trim().toLowerCase();
    const isInvitedByEmail = !campaign.providerId && manualEmail && myEmail && manualEmail.toLowerCase() === myEmail;

    if (!isLinkedByProviderId && !isInvitedByEmail) {
      return res.status(403).json({ message: "Not authorized. This campaign is not linked to your provider account." });
    }

    if (isInvitedByEmail && !campaign.providerId) {
      campaign.providerId = req.user.userId;
    }

    campaign.confirmationStatus = "provider_confirmed";
    campaign.providerConfirmedAt = new Date();

    // If admin has already approved, provider confirmation makes the campaign active
    if (campaign.adminStatus === "approved" && campaign.status === "PENDING") {
      campaign.status = "ACTIVE";
    }

    await campaign.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: "PROVIDER",
      actionType: "PROVIDER_CONFIRMED_CAMPAIGN",
      entityType: "Campaign",
      entityId: campaign._id,
      req
    });

    res.json({ campaign: formatCampaign(campaign) });
  } catch (err) {
    next(err);
  }
};

/* BENEFICIARY SERVICE RECEIPT CONFIRMATION */
export const confirmBeneficiary = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Not found" });

    if (req.user.role !== "BENEFICIARY") {
      return res.status(403).json({ message: "Only beneficiaries can confirm receipt" });
    }

    if (campaign.beneficiaryId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only confirm receipt for your own campaigns" });
    }

    const { confirmationNote } = req.body || {};
    const now = new Date();

    campaign.beneficiaryConfirmedAt = now;
    campaign.beneficiaryReceipt = {
      confirmedAt: now,
      note: confirmationNote || ""
    };

    if (campaign.confirmationStatus === "provider_confirmed") {
      campaign.confirmationStatus = "both_confirmed";
    }

    if (campaign.disbursementStatus === "none") {
      campaign.disbursementStatus = "pending";
    }

    await campaign.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: "BENEFICIARY",
      actionType: "BENEFICIARY_CONFIRMED_RECEIPT",
      entityType: "Campaign",
      entityId: campaign._id,
      metadata: { note: confirmationNote || null },
      req
    });

    res.json({ campaign: formatCampaign(campaign) });
  } catch (err) {
    next(err);
  }
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
      confirmationStatus,
      providerId,
      includeHidden
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
    if (providerId) filter.providerId = providerId;

    // By default, do not return hidden campaigns to public callers.
    // Admins or explicit includeHidden=true can see everything.
    const isAdmin = req.user && req.user.role === "ADMIN";
    if (!isAdmin && String(includeHidden) !== "true") {
      filter.isHidden = { $ne: true };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate("beneficiaryId", "firstName lastName email beneficiaryProfile.displayName")
        .populate("providerId", "businessName email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Campaign.countDocuments(filter)
    ]);

    // Enhance campaigns with donorCount
    const enhancedCampaigns = await Promise.all(campaigns.map(async (c) => {
      const donorCount = await mongoose.model("Donation").distinct("donorId", {
        campaignId: c._id,
        status: "COMPLETED"
      }).then(res => res.length);
      const formatted = formatCampaign(c);
      return { ...formatted, donorCount };
    }));

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      campaigns: enhancedCampaigns
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
        .populate("beneficiaryId", "firstName lastName email beneficiaryProfile.displayName")
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
 * Get campaigns for the current provider: assigned (providerId) OR invited by email (metadata.manualProvider.email)
 */
export const getCampaignsForProvider = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const providerDoc = await Provider.findOne({ userId: req.user.userId });
    const myEmail = (providerDoc?.email || req.user.email || "").trim().toLowerCase();
    const filter = {
      $or: [
        { providerId: req.user.userId },
        ...(myEmail
          ? [{ "metadata.manualProvider.email": { $regex: new RegExp(`^${myEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") } }]
          : [])
      ]
    };
    const skip = (Number(page) - 1) * Number(limit);
    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate("beneficiaryId", "firstName lastName email beneficiaryProfile.displayName")
        .populate("providerId", "firstName lastName email organization phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Campaign.countDocuments(filter)
    ]);
    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      campaigns: campaigns.map((c) => formatCampaign(c))
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

    const baseQuery = byPublic ? { publicId: id } : { _id: id };

    // Hide hidden campaigns from public detail unless admin
    const isAdmin = req.user && req.user.role === "ADMIN";
    if (!isAdmin) {
      baseQuery.isHidden = { $ne: true };
    }

    const campaign = await Campaign.findOne(baseQuery)
      .populate("beneficiaryId", "firstName lastName email beneficiaryProfile.displayName")
      .populate("providerId", "firstName lastName organization phoneNumber");

    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const donorCount = await mongoose.model("Donation").distinct("donorId", {
      campaignId: campaign._id,
      status: "COMPLETED"
    }).then(res => res.length);

    res.json({
      campaign: {
        ...formatCampaign(campaign),
        donorCount
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /campaigns/:id/withdrawals - list withdrawals for this campaign (transparency, public)
 */
export const getCampaignWithdrawals = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const withdrawals = await Withdrawal.find({ campaignId: req.params.id })
      .populate("providerId", "businessName email")
      .sort({ createdAt: -1 });
    res.json({ withdrawals: withdrawals.map((w) => w.toClient()) });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /campaigns/:id/transactions - donations summary + withdrawals for transparency (all portals)
 */
export const getCampaignTransactions = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const [donationStats, withdrawals] = await Promise.all([
      Donation.aggregate([
        {
          $match: {
            campaignId: new mongoose.Types.ObjectId(campaignId),
            status: "COMPLETED",
          },
        },
        {
          $group: {
            _id: null,
            donationCount: { $sum: 1 },
            totalDonations: { $sum: "$amountFiat" },
          },
        },
      ]).then((r) =>
        r[0]
          ? {
              donationCount: r[0].donationCount,
              totalDonations: parseFloat(String(r[0].totalDonations || 0)),
            }
          : { donationCount: 0, totalDonations: 0 }
      ),
      Withdrawal.find({ campaignId })
        .populate("providerId", "businessName email")
        .sort({ createdAt: -1 })
        .then((list) => list.map((w) => w.toClient())),
    ]);

    res.json({
      donationCount: donationStats.donationCount,
      totalDonations: donationStats.totalDonations,
      withdrawals,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update Campaign - owner or admin. Provider/manualProvider only when PENDING and not provider_confirmed.
 */
export const updateCampaign = async (req, res, next) => {
  try {
    const { title, description, targetAmount, currency, providerId, status, category, metadata: bodyMetadata } = req.body;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    // Permission check
    if (campaign.beneficiaryId.toString() !== req.user.userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not allowed" });
    }

    const canEditProvider = campaign.status === "PENDING" && campaign.confirmationStatus !== "provider_confirmed";

    if (title !== undefined) campaign.title = title;
    if (description !== undefined) campaign.description = description;
    if (targetAmount !== undefined) campaign.targetAmount = mongoose.Types.Decimal128.fromString(String(targetAmount));
    if (currency !== undefined) campaign.currency = currency;
    if (status !== undefined) campaign.status = status;
    if (category !== undefined) campaign.category = category;

    // Provider / manualProvider only when campaign is still pending provider confirmation
    if (canEditProvider) {
      if (providerId !== undefined) {
        if (providerId === null || providerId === "") {
          campaign.providerId = null;
        } else {
          const provider = await Provider.findById(providerId);
          campaign.providerId = provider ? provider.userId : providerId;
        }
      }
      if (bodyMetadata && typeof bodyMetadata === "object" && bodyMetadata.manualProvider) {
        campaign.metadata = campaign.metadata || {};
        campaign.metadata.manualProvider = {
          name: bodyMetadata.manualProvider.name ?? campaign.metadata.manualProvider?.name,
          phone: bodyMetadata.manualProvider.phone ?? campaign.metadata.manualProvider?.phone,
          email: bodyMetadata.manualProvider.email ?? campaign.metadata.manualProvider?.email,
        };
      }
    }

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
      .populate("beneficiaryId", "firstName lastName email beneficiaryProfile.displayName")
      .populate("providerId", "firstName lastName organization phoneNumber");

    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    if (status === "approved") {
      const providerOk = campaign.providerAccepted === true || campaign.confirmationStatus === "provider_confirmed";
      if (!providerOk) {
        return res.status(400).json({
          message: "Provider must approve campaign before admin approval.",
        });
      }
    }

    const oldStatus = campaign.adminStatus;
    campaign.adminStatus = status;

    // When admin approves and provider has already accepted/confirmed, mark lifecycle as ACTIVE
    if (
      status === "approved" &&
      campaign.status === "PENDING" &&
      (campaign.providerAccepted || campaign.confirmationStatus === "provider_confirmed")
    ) {
      campaign.status = "ACTIVE";
    }

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
 * Admin: hide or unhide a campaign from public view
 * PATCH /campaigns/:id/visibility { isHidden: boolean }
 */
export const adminUpdateCampaignVisibility = async (req, res, next) => {
  try {
    const { isHidden } = req.body;
    if (typeof isHidden !== "boolean") {
      return res.status(400).json({ message: "isHidden boolean is required" });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: "Campaign not found" });

    const previous = campaign.isHidden;
    campaign.isHidden = isHidden;
    await campaign.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: isHidden ? "ADMIN_HID_CAMPAIGN" : "ADMIN_UNHID_CAMPAIGN",
      entityType: "Campaign",
      entityId: campaign._id,
      description: `Campaign visibility changed from ${previous ? "hidden" : "visible"} to ${isHidden ? "hidden" : "visible"} by admin`,
      metadata: { previous, isHidden },
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

  if (campaign.adminStatus !== "approved") {
    return res.status(400).json({ message: "Campaign not approved by admin" });
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

/**
 * Beneficiary disburses funds to provider (campaign owner only).
 * POST /campaigns/:id/disburse-to-provider — body: { amount, notes? }
 */
export const beneficiaryDisburseToProvider = async (req, res, next) => {
  try {
    if (req.user.role !== "BENEFICIARY") {
      return res.status(403).json({ message: "Only beneficiaries can disburse to provider" });
    }

    const { amount, notes } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    if (String(campaign.beneficiaryId) !== req.user.userId) {
      return res.status(403).json({ message: "Only the campaign owner can disburse" });
    }

    if (!campaign.providerId) {
      return res.status(400).json({ message: "Campaign has no provider linked" });
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const amountRaised = parseFloat(String(campaign.amountRaised ?? 0));
    const alreadyDisbursed = await Disbursement.aggregate([
      { $match: { campaignId: campaign._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const disbursedTotal = alreadyDisbursed[0]?.total ?? 0;
    const available = Math.max(0, amountRaised - disbursedTotal);
    if (amountNum > available) {
      return res.status(400).json({
        message: `Amount cannot exceed available $${available.toLocaleString()}`
      });
    }

    const providerDoc = await Provider.findOne({ userId: campaign.providerId });
    if (!providerDoc) {
      return res.status(400).json({ message: "Provider record not found" });
    }

    const disbursement = await Disbursement.create({
      campaignId: campaign._id,
      beneficiaryId: campaign.beneficiaryId,
      providerId: providerDoc._id,
      amount: amountNum,
      currency: campaign.currency || "USD",
      status: "completed",
      disbursedAt: new Date(),
      notes: notes || undefined
    });

    const reference = `DISP-${Date.now()}-${campaign._id.toString().slice(-6)}`;
    const withdrawal = await Withdrawal.create({
      campaignId: campaign._id,
      providerId: providerDoc._id,
      amount: mongoose.Types.Decimal128.fromString(String(amountNum)),
      currency: campaign.currency || "USD",
      status: "COMPLETED",
      reference
    });

    campaign.disbursementStatus = "completed";
    campaign.disbursedAt = new Date();
    await campaign.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: "BENEFICIARY",
      actionType: "BENEFICIARY_DISBURSED_TO_PROVIDER",
      entityType: "Campaign",
      entityId: campaign._id,
      metadata: { amount: amountNum, providerId: providerDoc._id },
      req
    });

    res.status(201).json({
      disbursement: {
        ...disbursement.toObject(),
        _id: disbursement._id
      },
      withdrawal: withdrawal.toClient ? withdrawal.toClient() : withdrawal
    });
  } catch (err) {
    next(err);
  }
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
