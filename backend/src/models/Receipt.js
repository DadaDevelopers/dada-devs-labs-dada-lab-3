import mongoose from "mongoose";
const { Schema } = mongoose;

const ReceiptSchema = new Schema({
  donation: { type: Schema.Types.ObjectId, ref: "DonationM", required: true },

  donorName: String,
  donorEmail: String,

  paymentMethod: String,
  amount: Number,
  currency: String,

  lightningInvoice: String,
  bitcoinAddress: String,
  mpesaCheckoutId: String,

  issuedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Receipt", ReceiptSchema);