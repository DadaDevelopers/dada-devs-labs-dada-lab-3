//userControllers
//Here is not about authentication(no logins, tokens or verification, they are in authController.js)
import crypto from "crypto";
import mongoose from "mongoose";
import { User, RefreshToken } from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Disbursement from "../models/Disbursement.js";
import bcrypt from "bcryptjs";
import { verifyAccessToken } from "../utils/token.js";
import Upload from "../models/Upload.js";
import { logActivity } from "../utils/activityLogger.js";
import ActivityLog from "../models/ActivityLog.js"; // optional if you need it here

import { beneficiaryProfileCompleteness } from "../utils/profileCompleteness.js";

// helpers
function hashValue(value, salt = process.env.SECRET_SALT || "default_salt") {
  return crypto.createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

/**
 * GET /api/user/me
 * Get current logged-in user info - Full profile to the owner (no passwordHash)
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("beneficiaryProfile.profilePicture", "url name mimeType")
      .populate("beneficiaryProfile.nationalIdUpload", "url name mimeType")
      .populate("beneficiaryProfile.supportingDocs", "url name mimeType");
    if (!user) return res.status(404).json({ message: "User not found" });

    //dashboard will know when to block campaign creation and when to show "Complete your profile (80%)"
    const profileProgress = user.role === "BENEFICIARY"
      ? beneficiaryProfileCompleteness(user)
      : null;

    res.json({ user, profileProgress });
  } catch (err) { next(err); }
};

/**
 * GET /api/users/me/metrics — beneficiary dashboard metrics
 */
export const getBeneficiaryMetrics = async (req, res, next) => {
  try {
    if (req.user.role !== "BENEFICIARY") {
      return res.status(403).json({ message: "Only beneficiaries can access metrics" });
    }
    const beneficiaryId = req.user.userId;

    const campaigns = await Campaign.find({ beneficiaryId }).select("amountRaised status");
    let totalAidReceived = 0;
    campaigns.forEach((c) => {
      if (c.amountRaised) totalAidReceived += parseFloat(c.amountRaised.toString());
    });
    const campaignsSupportingYou = campaigns.filter((c) => c.status === "ACTIVE").length;
    // totalDisbursements: stub until Disbursement/Payment flow is implemented
    const totalDisbursements = 0;

    res.json({
      metrics: {
        totalAidReceived,
        totalDisbursements,
        campaignsSupportingYou
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/me/disbursements — beneficiary list of disbursements (paginated)
 */
export const getBeneficiaryDisbursements = async (req, res, next) => {
  try {
    if (req.user.role !== "BENEFICIARY") {
      return res.status(403).json({ message: "Only beneficiaries can access disbursements" });
    }
    const { page = 1, limit = 20, status, campaignId } = req.query;
    const filter = { beneficiaryId: req.user.userId };
    if (status) filter.status = status;
    if (campaignId) filter.campaignId = campaignId;

    const skip = (Number(page) - 1) * Number(limit);
    const [disbursements, total] = await Promise.all([
      Disbursement.find(filter).sort({ disbursedAt: -1, createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Disbursement.countDocuments(filter)
    ]);

    const list = disbursements.map((d) => ({
      id: d._id,
      campaignId: d.campaignId,
      amount: d.amount,
      currency: d.currency,
      status: d.status,
      disbursedAt: d.disbursedAt || d.createdAt,
      description: d.notes || null,
      transactionRef: d.transactionRef || null
    }));

    res.json({ page: Number(page), limit: Number(limit), total, disbursements: list });
  } catch (err) {
    next(err);
  }
};

// Update current user's profile
/**
 * PUT /api/user/me
 * Update allowed profile fields. Key identity changes (email/phone) must go via request endpoints.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      country,
      city,
      preferredLanguage,
      preferredCurrency,
      preferredContactMethod,
      profileVisibility,
      publicProfileFields,
      beneficiaryProfile,
      providerProfile,
      donorProfile
    } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Basic top-level updates
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (country !== undefined) user.country = country;
    if (city !== undefined) user.city = city;
    if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;
    if (preferredCurrency !== undefined) user.preferredCurrency = preferredCurrency;
    if (preferredContactMethod !== undefined) user.preferredContactMethod = preferredContactMethod;
    if (profileVisibility !== undefined) user.profileVisibility = profileVisibility;
    if (Array.isArray(publicProfileFields)) user.publicProfileFields = publicProfileFields;

    // BENEFICIARY updates
    if (beneficiaryProfile && (user.role === "BENEFICIARY" || user.role === "UNASSIGNED")) {
      // allow UNASSIGNED -> claim beneficiary role on profile fill
      if (user.role === "UNASSIGNED") user.role = "BENEFICIARY";

      const {
        displayName,
        profilePicture,      // single upload id
        shortStory,
        category,
        preferredProvider,
        supportingDocs,      // array of upload ids
        nationalId,          // plaintext nationalId (we will hash it NOT store plaintext)
        nationalIdUpload,    // upload id
        consentContact       // { agreed: true, version: 'v1.1' } OR boolean
      } = beneficiaryProfile;

      if (displayName !== undefined) user.beneficiaryProfile.displayName = displayName;

      // validate profilePicture ownership if provided
      if (profilePicture !== undefined) {
        const picId = profilePicture.id || profilePicture._id || profilePicture;
        if (picId) {
          const upload = await Upload.findOne({ _id: picId, userId: user._id, status: "uploaded" });
          if (!upload) return res.status(400).json({ message: "Invalid profilePicture" });
          user.beneficiaryProfile.profilePicture = upload._id;
        } else {
          user.beneficiaryProfile.profilePicture = null;
        }
      }

      if (shortStory !== undefined) user.beneficiaryProfile.shortStory = shortStory;
      if (category !== undefined) user.beneficiaryProfile.category = category;
      if (preferredProvider !== undefined) user.beneficiaryProfile.preferredProvider = preferredProvider;

      // supportingDocs: validate uploads and set refs
      if (Array.isArray(supportingDocs)) {
        const ids = supportingDocs.map(d => d.id || d._id || d).filter(Boolean);
        const uploads = await Upload.find({ _id: { $in: ids }, userId: user._id, status: "uploaded" });
        if (uploads.length !== ids.length) return res.status(400).json({ message: "Invalid supportingDocs" });
        user.beneficiaryProfile.supportingDocs = uploads.map(u => u._id);
      }

      // nationalId handling: DO NOT store plaintext ID.
      if (nationalId !== undefined && nationalId !== null && nationalId !== "") {
        user.beneficiaryProfile.nationalIdHash = hashValue(nationalId);
        // mark identity as unverified since new ID submitted
        user.beneficiaryProfile.identityVerified = false;
        user.beneficiaryProfile.verificationNotes = "Submitted nationalId (hashed) - awaiting verification";
        // optionally: flag KYC state or notify admin via logActivity
        user.kyc.status = user.kyc.status === "NOT_REQUIRED" ? "PENDING" : user.kyc.status;
        user.kyc.submittedAt = new Date();
      }

      // nationalIdUpload: validate ownership and attach
      if (nationalIdUpload !== undefined) {
        const uploadId = nationalIdUpload.id || nationalIdUpload._id || nationalIdUpload;
        if (uploadId) {
          const upload = await Upload.findOne({ _id: uploadId, userId: user._id, status: "uploaded" });
          if (!upload) return res.status(400).json({ message: "Invalid nationalIdUpload" });
          user.beneficiaryProfile.nationalIdUpload = upload._id;
          // same effect: mark verify pending
          user.beneficiaryProfile.identityVerified = false;
          user.beneficiaryProfile.verificationNotes = "National ID document uploaded - awaiting verification";
          user.kyc.status = user.kyc.status === "NOT_REQUIRED" ? "PENDING" : user.kyc.status;
          user.kyc.submittedAt = new Date();
        } else {
          user.beneficiaryProfile.nationalIdUpload = null;
        }
      }

      // consentContact handling: support boolean or object
      if (consentContact !== undefined) {
        if (typeof consentContact === "boolean") {
          user.beneficiaryProfile.consentContact.agreed = consentContact;
          user.beneficiaryProfile.consentContact.agreedAt = consentContact ? new Date() : null;
          user.beneficiaryProfile.consentContact.version = consentContact ? (user.acceptedTerms.version || null) : null;
        } else if (typeof consentContact === "object") {
          const agreed = !!consentContact.agreed;
          user.beneficiaryProfile.consentContact.agreed = agreed;
          user.beneficiaryProfile.consentContact.agreedAt = agreed ? (consentContact.agreedAt ? new Date(consentContact.agreedAt) : new Date()) : null;
          user.beneficiaryProfile.consentContact.version = consentContact.version || user.acceptedTerms.version || null;
        }

        // push to global consentHistory for audit
        user.consentHistory = user.consentHistory || [];
        user.consentHistory.push({
          type: "CONTACT",
          version: user.beneficiaryProfile.consentContact.version,
          accepted: !!user.beneficiaryProfile.consentContact.agreed,
          acceptedAt: user.beneficiaryProfile.consentContact.agreedAt,
          ip: req.ip,
          userAgent: req.get("User-Agent")
        });
      }
    }

    // PROVIDER handling (unchanged but keep validation)
    if (providerProfile && user.role === "PROVIDER") {
      const {
        organizationType, businessRegNumber, contactPerson,
        bankAccountName, bankAccountNumber, bankName,
        lightningPubkey, shortDescription, licenseDocs
      } = providerProfile;

      if (organizationType !== undefined) user.providerProfile.organizationType = organizationType;
      if (businessRegNumber !== undefined) user.providerProfile.businessRegNumber = businessRegNumber;
      if (contactPerson !== undefined) user.providerProfile.contactPerson = contactPerson;
      if (bankAccountName !== undefined) user.providerProfile.bankAccountName = bankAccountName;
      if (bankAccountNumber !== undefined) user.providerProfile.bankAccountNumber = bankAccountNumber;
      if (bankName !== undefined) user.providerProfile.bankName = bankName;
      if (lightningPubkey !== undefined) user.providerProfile.lightningPubkey = lightningPubkey;
      if (shortDescription !== undefined) user.providerProfile.shortDescription = shortDescription;

      if (Array.isArray(licenseDocs)) {
        const ids = licenseDocs.map(d => d.id || d._id || d).filter(Boolean);
        const uploads = await Upload.find({ _id: { $in: ids }, userId: user._id, status: "uploaded" });
        if (uploads.length !== ids.length) return res.status(400).json({ message: "Invalid licenseDocs" });
        user.providerProfile.licenseDocs = uploads.map(u => u._id);

        if (["NOT_REQUIRED", "REJECTED"].includes(user.kyc.status)) {
          user.kyc.status = "PENDING";
          user.kyc.submittedAt = new Date();
        }
      }
    }

    // DONOR updates
    if (donorProfile) {
      const { displayName, preferredCategories, isAnonymousDefault } = donorProfile;
      if (displayName !== undefined) user.donorProfile.displayName = displayName;
      if (Array.isArray(preferredCategories)) user.donorProfile.preferredCategories = preferredCategories;
      if (isAnonymousDefault !== undefined) user.donorProfile.isAnonymousDefault = isAnonymousDefault;
    }

    await user.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "USER_UPDATED_PROFILE",
      entityType: "User",
      entityId: user._id.toString(),
      description: "Updated profile via /user/me",
      req
    });

    const out = user.toObject({ getters: true, virtuals: false });
    delete out.passwordHash;
    res.json({ user: out });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/user/me/consent-contact
 * Dedicated endpoint to record contact consent with explicit versioning
 */
export const setConsentContact = async (req, res, next) => {
  try {
    // body: { agreed: true, version: "v1.1" }
    const { agreed, version } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.beneficiaryProfile = user.beneficiaryProfile || {};
    user.beneficiaryProfile.consentContact = user.beneficiaryProfile.consentContact || {};

    user.beneficiaryProfile.consentContact.agreed = !!agreed;
    user.beneficiaryProfile.consentContact.agreedAt = agreed ? new Date() : null;
    user.beneficiaryProfile.consentContact.version = version || user.acceptedTerms.version || null;

    user.consentHistory = user.consentHistory || [];
    user.consentHistory.push({
      type: "CONTACT",
      version: user.beneficiaryProfile.consentContact.version,
      accepted: !!agreed,
      acceptedAt: user.beneficiaryProfile.consentContact.agreedAt,
      ip: req.ip,
      userAgent: req.get("User-Agent")
    });

    await user.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "USER_SET_CONSENT_CONTACT",
      entityType: "User",
      entityId: user._id.toString(),
      description: `User set contact consent = ${!!agreed}`,
      req
    });

    res.json({ message: "Consent saved", consentContact: user.beneficiaryProfile.consentContact });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/user/me/request-email-change
 * Backend stores pendingEmail with tokenHash — actual email sending should be done in authController/email service.
 * Body: { newEmail }
 */
export const requestEmailChange = async (req, res, next) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ message: "Missing newEmail" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // create a verification token and store hashed version
    const token = generateToken();
    const tokenHash = hashValue(token);

    user.pendingEmail = {
      newEmail,
      verificationTokenHash: tokenHash,
      requestedAt: new Date()
    };

    await user.save();

    // The real sending of the token link/email is handled elsewhere (auth/email service).
    // Return a success message but never return token itself in production.
    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "USER_REQUEST_EMAIL_CHANGE",
      entityType: "User",
      entityId: user._id.toString(),
      description: "Requested email change",
      req
    });

    res.json({ message: "Email change requested. Confirm via verification email (sent separately)." });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/user/me/request-phone-change
 * Body: { newPhone }
 * Stores pendingPhone with verification token hash. SMS sending handled in auth/sms service.
 */
export const requestPhoneChange = async (req, res, next) => {
  try {
    const { newPhone } = req.body;
    if (!newPhone) return res.status(400).json({ message: "Missing newPhone" });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = generateToken();
    const tokenHash = hashValue(token);

    user.pendingPhone = {
      newPhone,
      verificationTokenHash: tokenHash,
      requestedAt: new Date()
    };

    await user.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "USER_REQUEST_PHONE_CHANGE",
      entityType: "User",
      entityId: user._id.toString(),
      description: "Requested phone change",
      req
    });

    res.json({ message: "Phone change requested. Confirm via verification SMS (sent separately)." });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:publicId/public
 * Public view respecting profileVisibility and publicProfileFields.
 */
export const getPublicProfile = async (req, res, next) => {
  try {
    const { publicId } = req.params;
    const user = await User.findOne({ publicId, isDeleted: false }).select("-passwordHash -pendingEmail -pendingPhone -consentHistory");
    if (!user) return res.status(404).json({ message: "User not found" });

    // If profile is private, return minimal
    if (user.profileVisibility === "PRIVATE") {
      return res.json({
        public: {
          publicId: user.publicId,
          displayName: user.beneficiaryProfile?.displayName || `${user.firstName} ${user.lastName || ""}`.trim(),
          category: user.beneficiaryProfile?.category || null
        }
      });
    }

    // Build allowed fields set (either user.publicProfileFields or default)
    const allowed = Array.isArray(user.publicProfileFields) && user.publicProfileFields.length > 0
      ? user.publicProfileFields
      : ["displayName", "shortStory", "category", "profilePicture", "country", "city"];

    const out = {
      publicId: user.publicId,
      displayName: user.beneficiaryProfile?.displayName || `${user.firstName} ${user.lastName || ""}`.trim()
    };

    if (allowed.includes("shortStory")) out.shortStory = user.beneficiaryProfile?.shortStory;
    if (allowed.includes("category")) out.category = user.beneficiaryProfile?.category;
    if (allowed.includes("profilePicture") && user.beneficiaryProfile?.profilePicture) out.profilePicture = user.beneficiaryProfile.profilePicture;
    if (allowed.includes("country")) out.country = user.country;
    if (allowed.includes("city")) out.city = user.city;

    res.json({ public: out });
  } catch (err) {
    next(err);
  }
};

/**
 * ADMIN: POST /api/admin/users/:id/verify-identity
 * Admin approves identity documents for a beneficiary
 * Body: { identityVerified: true, notes: "..." }
 */
export const adminVerifyIdentity = async (req, res, next) => {
  try {
    if (!["SUPER_ADMIN", "ADMIN"].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });

    const targetId = req.params.id;
    const { identityVerified, notes } = req.body;

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.beneficiaryProfile.identityVerified = !!identityVerified;
    user.beneficiaryProfile.verificationNotes = notes || null;

    // if approved, set kyc/verified flags as needed
    if (identityVerified) {
      user.beneficiaryProfile.identityVerified = true;
      user.kyc.status = user.kyc.status === "PENDING" ? "APPROVED" : user.kyc.status;
      user.kyc.reviewedAt = new Date();
      user.kyc.reviewedBy = req.user.userId;
    } else {
      user.kyc.status = "REJECTED";
      user.kyc.reviewedAt = new Date();
      user.kyc.reviewedBy = req.user.userId;
      user.kyc.rejectionReason = notes || "Rejected by admin";
    }

    await user.save();

    await logActivity({
      actorId: req.user.userId,
      actorRole: req.user.role,
      actionType: "ADMIN_VERIFY_IDENTITY",
      entityType: "User",
      entityId: user._id.toString(),
      description: `Identity verification set to ${!!identityVerified}`,
      metadata: { notes },
      req
    });

    res.json({ message: "Verification status updated", beneficiaryProfile: user.beneficiaryProfile });
  } catch (err) {
    next(err);
  }
};

export default {
  getMe,
  getBeneficiaryMetrics,
  updateProfile,
  setConsentContact,
  requestEmailChange,
  requestPhoneChange,
  getPublicProfile,
  adminVerifyIdentity
};


// Admin: list all users (pagination, search, sorting, soft delete aware)
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      sortBy = "createdAt",
      order = "desc",
      includeDeleted = "false"
    } = req.query;

    const filter = {};

    // Role filter
    if (role) filter.role = role;

    // Soft delete filter
    if (includeDeleted !== "true") {
      filter.isDeleted = false;
    }

    // Search (email / firstName / lastName)
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } }
      ];
    }

    // Sorting
    const sort = {
      [sortBy]: order === "asc" ? 1 : -1
    };

    const users = await User.find(filter)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select("-passwordHash");

    const total = await User.countDocuments(filter);

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      users
    });
  } catch (err) {
    next(err);
  }
};



// Admin: get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) { next(err); }
};

// Admin: update user role
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const actorId = req.user.userId;
    const targetId = req.params.id;

    if (!role) return res.status(400).json({ message: "Missing role" });

    // Allowed non-admin roles by default
    const allowedRoles = ["DONOR", "BENEFICIARY", "PROVIDER"];

    // If trying to assign ADMIN, require SUPER_ADMIN
    if (role === "ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Only SUPER_ADMIN can assign ADMIN role" });
    }

    if (!allowedRoles.includes(role) && role !== "ADMIN") {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (actorId === targetId) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Protect admin accounts (only SUPER_ADMIN can change an ADMIN)
    if (user.role === "ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Cannot change role of an ADMIN" });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logActivity({
      actorId,
      actorRole: req.user.role,
      actionType: "ADMIN_CHANGED_USER_ROLE",
      entityType: "User",
      entityId: user._id,
      description: `Changed role ${oldRole} -> ${role}`,
      metadata: { oldRole, newRole: role },
      req
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
};


// Admin: soft-delete user
// Admin: soft-delete user (improved)
export const adminDeleteUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const actorId = req.user.userId;

    if (actorId === targetId) {
      return res.status(400).json({ message: "Admin cannot delete their own account" });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isDeleted) {
      return res.status(400).json({ message: "User already scheduled for deletion" });
    }

    const now = new Date();
    const deletionDate = new Date(now);
    deletionDate.setDate(deletionDate.getDate() + 30);

    user.isDeleted = true;
    user.deletedAt = now;
    user.scheduledDeletionAt = deletionDate;

    await user.save();

    // Revoke any refresh tokens (example model RefreshToken)
    await RefreshToken.updateMany(
      { userId: user._id, revoked: false },
      { $set: { revoked: true, revokedAt: new Date() } }
    );

    // Audit log (example)
    // await AuditLog.create({
    //   actorId,
    //   actionType: "ADMIN_SCHEDULE_DELETE_USER",
    //   entityType: "User",
    //   entityId: user._id.toString(),
    //   description: `Scheduled deletion (30 days) by admin ${actorId}`
    // });
    //logActivity centralizes metadata like ip and user-agent and handles errors safely.
    await logActivity({
      actorId,
      actorRole: req.user.role,
      actionType: "ADMIN_SCHEDULE_DELETE_USER",
      entityType: "User",
      entityId: user._id.toString(),
      description: `Scheduled deletion (30 days) by admin ${actorId}`,
      metadata: { recoverBefore: deletionDate },
      req
    });

    res.json({ message: "User scheduled for deletion by admin", recoverBefore: deletionDate });
  } catch (err) {
    next(err);
  }
};



/* Desired Behavior (Confirmed)
✔ User can request account deletion
✔ Account becomes inactive immediately
✔ User can recover within 30 days
✔ Login blocked and funds remain protected
✔ After 30 days → permanent deletion
✔ Financial records (donations, payments, invoices) remain compliant */

// User: request account deletion (30-day recovery window)
export const requestAccountDeletion = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isDeleted) {
      return res.status(400).json({ message: "Account already scheduled for deletion" });
    }

    const now = new Date();
    const deletionDate = new Date(now);
    deletionDate.setDate(deletionDate.getDate() + 30);

    user.isDeleted = true;
    user.deletedAt = now;
    user.scheduledDeletionAt = deletionDate;

    await user.save();

    res.json({
      message: "Account scheduled for deletion",
      recoverBefore: deletionDate
    });
  } catch (err) {
    next(err);
  }
};


// User: recover/restore account before/within 30 days
export const restoreAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isDeleted) {
      return res.status(400).json({ message: "Account is not deleted" });
    }

    if (new Date() > user.scheduledDeletionAt) {
      return res.status(400).json({
        message: "Recovery window expired. Account permanently deleted."
      });
    }

    user.isDeleted = false;
    user.deletedAt = null;
    user.scheduledDeletionAt = null;

    await user.save();

    res.json({ message: "Account restored successfully" });
  } catch (err) {
    next(err);
  }
};
