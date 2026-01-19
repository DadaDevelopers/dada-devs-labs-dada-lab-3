import mongoose from "mongoose";

const ProviderVerificationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  verifiedDocs: [{ type: String }], // upload IDs or URLs
  status: { type: String, enum: ["VERIFIED", "NEEDS_INFO", "REJECTED"], required: true },
  notes: { type: String },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  verifiedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("ProviderVerification", ProviderVerificationSchema);
