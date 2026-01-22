import mongoose from "mongoose";
const { Schema } = mongoose;

const WithdrawalSchema = new Schema({
  provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
  amountSats: { type: Number, required: true },
  status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
  method: { type: String, enum: ["LNURL", "INVOICE"], required: true },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export default mongoose.model("Withdrawal", WithdrawalSchema);
