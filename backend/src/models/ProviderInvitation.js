import mongoose from "mongoose";

const ProviderInvitationSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
  providerEmail: { type: String, required: true },
  providerName: { type: String, required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  invitedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["PENDING", "ACCEPTED", "EXPIRED"], default: "PENDING" }
}, { timestamps: true });

export default mongoose.model("ProviderInvitation", ProviderInvitationSchema);
