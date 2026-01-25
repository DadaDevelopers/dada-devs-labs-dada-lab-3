import mongoose from "mongoose";
const { Schema } = mongoose;

const DonationMSchema = new Schema({
  donor: { type: Schema.Types.ObjectId, ref: "Donor", required: true },
  campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },

  // snapshot identity (important for receipts & audits)
  donorName: { type: String, required: true },
  donorEmail: { type: String, required: true },

  paymentMethod: {
    type: String,
    enum: ["MPESA", "LIGHTNING", "BITCOIN"],
    required: true
  },

  amount: { type: Number, required: true },

  // Always USD
  currency: { type: String, default: "USD" },

  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED"],
    default: "PENDING"
  },

  // Payment-specific fields
  checkoutId: { type: String },        // MPESA
  lightningInvoice: { type: String },  // Lightning
  bitcoinAddress: { type: String },    // BTC

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update timestamp
DonationMSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export default mongoose.model("DonationM", DonationMSchema);