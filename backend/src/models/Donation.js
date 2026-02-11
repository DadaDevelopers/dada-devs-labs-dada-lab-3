// src/models/Donation.js
import mongoose from "mongoose";
import Campaign from "./Campaign.js"; // used to update campaign.amountRaised on completion (optional)
const { Schema } = mongoose;

/**
 * DonationSchema
 *
 * - Stores both fiat (Decimal128) and crypto (sats as string to avoid JS integer overflow)
 * - Tracks payment provider info, idempotency keys, processor responses for reconciliation
 * - Post-save hook optionally increments Campaign.amountRaised when status transitions to COMPLETED
 */

const DonationSchema = new Schema({
  donorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

  // Link to campaign (optional if donation is general)
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", index: true },

  // ---- Amounts ----
  amountFiat: { type: Schema.Types.Decimal128, required: true },
  currency: { type: String, required: true }, // e.g. "KES", "USD"

  // On-chain / crypto specifics
  amountSats: { type: String, default: null }, // e.g. "12345" sats
  network: { type: String, default: null },    // 'bitcoin', 'lightning', 'ethereum', etc.

  // ---- Provider & reconciliation ----
  paymentMethod: {
    type: String,
    required: true,
    enum: ["mpesa", "onchain", "lightning"],
    index: true
  },

  paymentReference: { type: String }, // provider reference (Mpesa ref, txHash)
  externalId: { type: String },       // provider-side ID (for idempotency)

  // Payer info (optional snapshot at time of donation)
  payer: {
    name: String,
    email: String,
    phone: String
  },

  // Fees & conversions
  fees: { type: Schema.Types.Decimal128, default: 0 },
  exchangeRate: { type: Schema.Types.Decimal128, default: 1 },
  amountBase: { type: Schema.Types.Decimal128, default: null },

  // ---- Life-cycle & bookkeeping ----
  status: {
    type: String,
    enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
    default: "PENDING",
    index: true
  },

  appliedToCampaign: {
    type: Boolean,
    default: false,
    index: true
  },

  idempotencyKey: { type: String, sparse: true, index: true },

  // Optional receipt URL, notes
  receiptUrl: { type: String, default: null },
  notes: { type: String, default: null },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Pre-save: update updatedAt
 */
/*DonationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});*/
DonationSchema.pre("save", async function () {
  if (!this.reference) {
    this.reference = `DON-${Date.now()}-${Math.floor(
      Math.random() * 1000
    )}`;
  }
});


/**
 * Helper: convert Decimal128 fields to Number for JSON responses
 */
DonationSchema.methods.toClient = function () {
  const obj = this.toObject({ getters: true, virtuals: false });

  const convertDecimal = (d) => {
    if (d === null || d === undefined) return d;
    try { return parseFloat(d.toString()); } catch { return d; }
  };

  obj.amountFiat = convertDecimal(obj.amountFiat);
  obj.fees = convertDecimal(obj.fees);
  obj.exchangeRate = convertDecimal(obj.exchangeRate);
  obj.amountBase = convertDecimal(obj.amountBase);

  // amountSats kept as string
  return obj;
};

/**
 * Post-save hook: increment Campaign.amountRaised if COMPLETED
 */
DonationSchema.post("save", async function (doc) {
  if (doc.status !== "COMPLETED" || !doc.campaignId || doc.appliedToCampaign === true) return;

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const freshDonation = await mongoose.model("Donation").findOne(
      { _id: doc._id, appliedToCampaign: false },
      null,
      { session }
    );

    if (!freshDonation) {
      await session.commitTransaction();
      await session.endSession();
      return;
    }

    const incrementValue = freshDonation.amountBase
      ? mongoose.Types.Decimal128.fromString(freshDonation.amountBase.toString())
      : mongoose.Types.Decimal128.fromString(freshDonation.amountFiat.toString());

    await mongoose.model("Campaign").findByIdAndUpdate(
      freshDonation.campaignId,
      { $inc: { amountRaised: incrementValue } },
      { session }
    );

    freshDonation.appliedToCampaign = true;
    await freshDonation.save({ session });

    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    console.error("Failed to apply donation to campaign:", err);
  } finally {
    await session.endSession();
  }
});

export default mongoose.model("Donation", DonationSchema);
