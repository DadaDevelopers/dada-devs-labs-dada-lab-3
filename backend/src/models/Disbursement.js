import mongoose from "mongoose";
const { Schema } = mongoose;

const DisbursementSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  beneficiaryId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  disbursedAt: { type: Date },
  description: { type: String },
  transactionRef: { type: String },
  paymentMethod: { type: String },
  createdAt: { type: Date, default: Date.now }
});

DisbursementSchema.index({ campaignId: 1, beneficiaryId: 1 });

export default mongoose.model("Disbursement", DisbursementSchema);
