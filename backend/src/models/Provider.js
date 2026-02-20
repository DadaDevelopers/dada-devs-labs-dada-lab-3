import mongoose from "mongoose";
const { Schema } = mongoose;

const PayoutMethodSchema = new Schema({
  method: {
    type: String,
    enum: ["LIGHTNING", "BITCOIN"],
    required: true
  },
  active: { type: Boolean, default: true },

  // LIGHTNING
  lightningAddress: { type: String },

  // BITCOIN
  btcAddress: { type: String },

  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ProviderSchema = new Schema({
  // Owner
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },

  // Public profile
  businessName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },

  // Campaigns handled by provider
  campaigns: [{
    type: Schema.Types.ObjectId,
    ref: "Campaign"
  }],

  // Payout
  payoutMethods: [PayoutMethodSchema],

  // KYC
  kycStatus: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED"],
    default: "PENDING"
  },
  kycNotes: String,
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },

  // Totals
  totalDonationsReceived: {
    type: Schema.Types.Decimal128,
    default: 0
  },

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update timestamp
ProviderSchema.pre("save", function () {
  this.updatedAt = new Date();
});

// Safe API output
ProviderSchema.methods.toClient = function () {
  const obj = this.toObject({ versionKey: false });

  // Convert Decimal128
  if (obj.totalDonationsReceived) {
    obj.totalDonationsReceived = parseFloat(
      obj.totalDonationsReceived.toString()
    );
  }

  // Payout methods are returned as-is (lightningAddress/btcAddress for display)
  if (Array.isArray(obj.payoutMethods)) {
    obj.payoutMethods = obj.payoutMethods.map(pm => ({ ...pm }));
  }

  return obj;
};

export default mongoose.model("Provider", ProviderSchema);
