import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

function cryptoRandomId() {
  return crypto.randomBytes(12).toString("hex");
}

// User Schema
const UserSchema = new Schema({
  publicId: { type: String, unique: true, default: cryptoRandomId },
  firstName: { type: String, required: true },
  lastName: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["DONOR","BENEFICIARY","PROVIDER","ADMIN", "UNASSIGNED"], default: "DONOR" },
  kycStatus: { type: String, enum: ["PENDING","APPROVED","REJECTED"], default: "PENDING" },
  phoneNumber: String,
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre("save", function(next) {
  this.updatedAt = new Date();
});

UserSchema.methods.matchPassword = async function(plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Refresh Token Schema
const RefreshTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  revokedAt: Date,
  ip: String,
  userAgent: String
});

// Verification Token Schema
const VerificationTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Password Reset Token Schema
const PasswordResetTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, unique: true },
  used: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Named exports
export const User = mongoose.model("User", UserSchema);
export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
export const VerificationToken = mongoose.model("VerificationToken", VerificationTokenSchema);
export const PasswordResetToken = mongoose.model("PasswordResetToken", PasswordResetTokenSchema);
