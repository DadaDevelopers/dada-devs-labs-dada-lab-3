import mongoose from "mongoose";
import crypto from "crypto";
const { Schema } = mongoose;

function cryptoRandomId() {
  return crypto.randomBytes(12).toString("hex");
}

const CampaignSchema = new Schema(
  {
    publicId: { type: String, unique: true, default: cryptoRandomId, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    // beneficiary/provider point to User model (role-based)
    beneficiaryId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    providerId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },

    // money fields stored as Decimal128 for precision
    targetAmount: { type: Schema.Types.Decimal128, required: true },
    amountRaised: { type: Schema.Types.Decimal128, default: mongoose.Types.Decimal128.fromString("0") },

    currency: { type: String, required: true, default: "USD" },

    // lifecycle vs admin moderation
    status: { type: String, enum: ["ACTIVE", "COMPLETED", "CANCELLED"], default: "ACTIVE", index: true },

    // admin moderation status (what admin sees/sets)
    adminStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "flagged"],
      default: "pending",
      index: true
    },

    // optional category or tags for filtering
    category: { type: String, index: true },

    // optional metadata
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true } // createdAt, updatedAt auto
);

// Virtual: percentRaised
CampaignSchema.virtual("percentRaised").get(function () {
  const target = this.targetAmount ? parseFloat(this.targetAmount.toString()) : 0;
  const raised = this.amountRaised ? parseFloat(this.amountRaised.toString()) : 0;
  if (!target) return 0;
  return Math.min(100, (raised / target) * 100);
});

export default mongoose.model("Campaign", CampaignSchema);
