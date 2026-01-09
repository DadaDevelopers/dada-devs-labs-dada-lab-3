// backend/src/models/User.js
import mongoose from "mongoose";
import crypto from "crypto";

const { Schema } = mongoose;

/* ---------- Helpers ---------- */
function generatePublicId() {
  return crypto.randomBytes(12).toString("hex");
}

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
    
    //Role and status
    role: {
      type: String,
      enum: ["UNASSIGNED", "DONOR", "BENEFICIARY", "PROVIDER", "ADMIN"],
      default: "UNASSIGNED",
      index:true
    },

    // Terms and conditions acceptance
    acceptedTerms: {
      accepted: { type: Boolean, default: false },
      version: { type: String },      // e.g. "v1.0", useful for re-consent on policy changes
      acceptedAt: { type: Date }
    },

    // Profile data (can be collected later during onboarding)
    phoneNumber: { type: String, index: true }, // store canonical E.164 (validated)
    country: { type: String, index: true },     // ISO2 or ISO3 code
    city: { type: String },
    organization: { type: String },             // optional, recommended for PROVIDER

    /* KYC applies only to PROVIDER & some BENEFICIARY cases */
    isEmailVerified: { type: Boolean, default: false },
    kycStatus: {
      type: String,
      enum: ["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_REQUIRED"
    },

    
    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },

    /*This allows:
    Users to be “deleted” without data loss, Auditability and Safe restoration if needed */
    isDeleted: { type: Boolean, default: false, index: true }, //login deletion flag
    deletedAt: { type: Date, default: null }, //when deletion was requested
    scheduledDeletionAt: { type: Date, default: null } //when permanent deletion happens(now+30days)
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
