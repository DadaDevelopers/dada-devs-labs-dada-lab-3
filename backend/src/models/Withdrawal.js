// src/models/Withdrawal.js - Provider payout request tied to a campaign (transparency)
import mongoose from "mongoose";
const { Schema } = mongoose;

const WithdrawalSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
  providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true, index: true },
  amount: { type: Schema.Types.Decimal128, required: true },
  currency: { type: String, default: "USD" },
  status: { type: String, enum: ["PENDING", "COMPLETED", "FAILED"], default: "PENDING", index: true },
  reference: { type: String },
  createdAt: { type: Date, default: Date.now },
});

WithdrawalSchema.methods.toClient = function () {
  const obj = this.toObject({ getters: true, versionKey: false });
  if (obj.amount) obj.amount = parseFloat(obj.amount.toString());
  return obj;
};

export default mongoose.model("Withdrawal", WithdrawalSchema);
