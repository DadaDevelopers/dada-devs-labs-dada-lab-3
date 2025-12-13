import mongoose from "mongoose";
import crypto from "crypto";
const { Schema } = mongoose;

function cryptoRandomId() {
  return crypto.randomBytes(12).toString("hex");
}

const CampaignSchema = new Schema({
  publicId: { type: String, unique: true, default: cryptoRandomId },
  title: { type: String, required: true },
  description: String,
  beneficiaryId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider" }, // optional
  targetAmount: { type: mongoose.Types.Decimal128, required: true },
  amountRaised: { type: mongoose.Types.Decimal128, default: 0 }, // new
  currency: { type: String, required: true },
  status: { type: String, enum: ["ACTIVE","COMPLETED","CANCELLED"], default: "ACTIVE" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CampaignSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("Campaign", CampaignSchema);
