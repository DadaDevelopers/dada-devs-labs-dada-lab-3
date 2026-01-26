// backend/src/models/User.js
import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

/* ---------- Helpers ---------- */
function generatePublicId() {
  return crypto.randomBytes(12).toString("hex");
}

const UploadRef = [{ type: Schema.Types.ObjectId, ref: "Upload" }];

/* ---------- User Schema ---------- */
const UserSchema = new Schema(
  {
    publicId: {
      type: String,
      unique: true,
      default: generatePublicId,
      index: true
    },

    //Core identity (collected at signup)
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },
    passwordHash: { type: String, required: true },
    
    // Terms and conditions acceptance
    acceptedTerms: {
      accepted: { type: Boolean, default: false },
      version: { type: String },      // e.g. "v1.0", useful for re-consent on policy changes
      acceptedAt: { type: Date }
    },

    //Role and status
    role: {
      type: String,
      enum: ["UNASSIGNED", "DONOR", "BENEFICIARY", "PROVIDER", "ADMIN"],
      default: "UNASSIGNED",
      index:true
    },

    // Profile data(contact and onboarding) - (can be collected later during onboarding)
    phoneNumber: { type: String, index: true }, // store canonical E.164 (validated)
    country: { type: String, index: true },     // ISO2 or ISO3 code
    city: { type: String },
    organization: { type: String },             // optional, recommended for PROVIDER

    preferredLanguage: { type: String, default: "en" },   // ISO code, optional
    preferredCurrency: { type: String, default: "USD" }, // ISO 4217, optional
    preferredContactMethod: { type: String, enum: ["email", "sms", "phone", "none"], default: "email" },
    profileSlug: { type: String, index: true, unique: false }, // optional public slug generated from displayName
    profileVisibility: {
      // global profile visibility control (who can see full profile)
      type: String,
      enum: ["PUBLIC", "REGISTERED_USERS", "PRIVATE"],
      default: "REGISTERED_USERS",
      index: true
    },
    publicProfileFields: [{ type: String }], // e.g. ["displayName","shortStory","country"]

    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    /* KYC metadata and audit trail - applies only to PROVIDER & some BENEFICIARY cases */
    // kycStatus: {
    //   type: String,
    //   enum: ["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"],
    //   default: "NOT_REQUIRED"
    // },

    kyc: {
      status: {
        type: String,
        enum: ["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"],
        default: "NOT_REQUIRED",
        index: true
      },
      submittedAt: Date,
      reviewedAt: Date,
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
      rejectionReason: String
    },

    // Role-specific profile blobs (frontend writes via PUT /user/me)
    beneficiaryProfile: {
      displayName: { type: String, default: null, index: true }, // public shown name
      profilePicture: { type: Schema.Types.ObjectId, ref: "Upload", default: null }, // store as upload ref
      shortStory: { type: String, default: null }, // already exist but ensure length validation in API
      category: { type: String, enum: ["medical","education","business","emergency","other"], default: "other", index: true },
      preferredProvider: { type: String, default: null },
      supportingDocs: UploadRef,
      
      // sensitive ID handling — avoid raw PII strings where possible
      nationalIdHash: { type: String, default: null },         // hashed copy if you must store
      nationalIdUpload: { type: Schema.Types.ObjectId, ref: "Upload", default: null }, // prefer upload
      
      // consent and contact preferences with audit
      consentContact: {
        agreed: { type: Boolean, default: false },
        agreedAt: { type: Date, default: null },
        version: { type: String, default: null }, // which consent/version accepted
      },

      // quick privacy toggles
      showNationality: { type: Boolean, default: false },
      showCity: { type: Boolean, default: true },

      // optional verification markers
      identityVerified: { type: Boolean, default: false },
      verificationNotes: { type: String, default: null }
    },

    providerProfile: {
      organizationType: { type: String, default: null },
      businessRegNumber: { type: String, default: null },
      contactPerson: { type: String, default: null },
      bankAccountName: { type: String, default: null },
      bankAccountNumber: { type: String, default: null },
      bankName: { type: String, default: null },
      lightningPubkey: { type: String, default: null },
      shortDescription: { type: String, default: null }, //desc about the organization
      licenseDocs: UploadRef //proof of business
    },

    donorProfile: {
      displayName: { type: String, default: null },
      preferredCategories: [{ type: String, enum: ["medical","education","business","emergency","other"] }],
      isAnonymousDefault: { type: Boolean, default: false }
    },

    // Account state separate from deletion flag
    accountStatus: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "PENDING_REVIEW", "DEACTIVATED"],
      default: "ACTIVE",
      index: true
    },

    // consent / terms history for the user (global)
    consentHistory: [
      {
        type: { type: String },         // e.g., "TERMS", "PRIVACY", "CONTACT"
        version: String,
        accepted: Boolean,
        acceptedAt: Date,
        ip: String,
        userAgent: String
      }
    ],

    // pending email/phone change objects (backend-managed)
    pendingEmail: {
      newEmail: String,
      verificationTokenHash: String,
      requestedAt: Date
    },
    pendingPhone: {
      newPhone: String,
      verificationTokenHash: String,
      requestedAt: Date

    },

    /*This allows:
    Users to be “deleted” without data loss, Auditability and Safe restoration if needed */
    isDeleted: { type: Boolean, default: false, index: true }, //login deletion flag
    deletedAt: { type: Date, default: null }, //when deletion was requested
    scheduledDeletionAt: { type: Date, default: null }, //when permanent deletion happens(now+30days)
    
    //Auditing
    lastLoginAt: Date
  },
  { timestamps: true }
);

/* ---------- Indexes ---------- */
//UserSchema.index({ email: 1 });
//UserSchema.index({ publicId: 1 });

/* ---------- Token Schemas ---------- */
const BaseTokenFields = {
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
};

const RefreshTokenSchema = new Schema({
  ...BaseTokenFields,
  revoked: { type: Boolean, default: false },
  revokedAt: Date,
  ip: String,
  userAgent: String
});

const VerificationTokenSchema = new Schema({
  ...BaseTokenFields,
  used: { type: Boolean, default: false }
});

const PasswordResetTokenSchema = new Schema({
  ...BaseTokenFields,
  used: { type: Boolean, default: false }
});

/* ---------- TTL indexes for automatic Cleanup ---------- */
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/* ---------- Exports ---------- */
export const User = mongoose.model("User", UserSchema);
export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
export const VerificationToken = mongoose.model("VerificationToken", VerificationTokenSchema);
export const PasswordResetToken = mongoose.model("PasswordResetToken", PasswordResetTokenSchema);