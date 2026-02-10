// models/Disbursement.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const DisbursementSchema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", index: true },
    beneficiaryId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    providerId: { type: Schema.Types.ObjectId, ref: "Provider", index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },
    paymentMethod: String,
    transactionRef: String,
    disbursedAt: Date,
    notes: String
  },
  { timestamps: true }
);

export default mongoose.model("Disbursement", DisbursementSchema);
