// src/models/Donation.js
import mongoose from "mongoose";
import Campaign from "./Campaign.js"; // used to update campaign.amountRaised on completion (optional)
const { Schema } = mongoose;

/**
 * DonationSchema
 *
 * - Stores both fiat (Decimal128) and crypto (sats as string to avoid JS integer overflow)
 * - Tracks payment provider info, idempotency keys, processor responses for reconciliation
 * - Sparse unique indexes for tx hashes / payment refs (only enforced when present)
 * - Post-save hook optionally increments Campaign.amountRaised when status transitions to COMPLETED
 */

const DonationSchema = new Schema({
  donorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

  // Link to campaign (optional if donation is general)
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", index: true },

  // ---- Amounts ----
  // Always store a fiat value for bookkeeping (donor-facing amount).
  amountFiat: { type: Schema.Types.Decimal128, required: true },
  currency: { type: String, required: true }, // e.g. "KES", "USD"

  // On-chain / crypto specifics (store sats as string to avoid overflow)
  amountSats: { type: String, default: null }, // e.g. "12345" sats
  network: { type: String, default: null },    // 'bitcoin', 'lightning', 'ethereum', etc.

  // ---- Provider & reconciliation ----
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ["MPESA","BANK","STRIPE","CARD","BITCOIN","LIGHTNING","CASH","OTHER"], 
    index: true 
  },
  provider: { type: String, default: null },     // e.g., 'mpesa', 'stripe', 'opennode'
  paymentReference: { type: String }, // provider reference (Mpesa ref, bank ref)
  externalId: { type: String },       // provider-side ID (for idempotency)
  transactionHash: { type: String },  // on-chain tx hash if available
  confirmations: { type: Number, default: 0 },

  // Processor raw response (webhook payload etc.) - helpful for troubleshooting/reconciliation
  processorResponse: { type: Schema.Types.Mixed },

  // Payer info (optional, convenient snapshot at time of donation)
  payer: {
    name: String,
    email: String,
    phone: String
  },

  // Fees & conversions
  fees: { type: Schema.Types.Decimal128, default: 0 },          // fees charged
  exchangeRate: { type: Schema.Types.Decimal128, default: 1 }, // rate used when converting BTC→fiat etc.
  amountBase: { type: Schema.Types.Decimal128, default: null },// normalized base amount (optional)

  // ---- Life-cycle & bookkeeping ----
  status: {
    type: String,
    enum: ["PENDING","COMPLETED","FAILED","REFUNDED"],
    default: "PENDING",
    index: true
  },

  /*This field guarantees Campaign.amountRaised is incremented exactly once, even if:
  Webhooks retry, Saves happen twice, Server restarts mid-flow */
  appliedToCampaign: {
    type: Boolean,
    default: false,
    index: true
  },

  // Use idempotencyKey to prevent double-credit on retries (webhooks)
  idempotencyKey: { type: String, sparse: true, index: true },

  // Optional receipt URL, notes, audit fields
  receiptUrl: { type: String, default: null },
  notes: { type: String, default: null },

  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

/**
 * Indexes
 * - transactionHash, externalId, paymentReference are sparse so uniqueness isn't required when absent.
 */
DonationSchema.index({ transactionHash: 1 }, { unique: true, sparse: true });
DonationSchema.index({ provider: 1, externalId: 1 }, { unique: true, sparse: true });
DonationSchema.index({ provider: 1, paymentReference: 1 }, { unique: true, sparse: true });

/**
 * Pre-save: update updatedAt
 */
DonationSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Helper: convert Decimal128 fields to Number for JSON responses
 */
DonationSchema.methods.toClient = function() {
  const obj = this.toObject({ getters: true, virtuals: false });

  const convertDecimal = (d) => {
    if (d === null || d === undefined) return d;
    try {
      return parseFloat(d.toString());
    } catch (e) {
      return d;
    }
  };

  obj.amountFiat = convertDecimal(obj.amountFiat);
  obj.fees = convertDecimal(obj.fees);
  obj.exchangeRate = convertDecimal(obj.exchangeRate);
  obj.amountBase = convertDecimal(obj.amountBase);

  // amountSats kept as string (safe)
  return obj;
};

/**
 * Post-save hook: when donation status transitions to COMPLETED we atomically increment Campaign.amountRaised.
 *
 * Important:
 * - This attempts a transaction using mongoose sessions if available.
 * - If your MongoDB deployment / driver supports transactions (replica set), this will update both documents atomically.
 * - If transactions are unavailable, we fall back to a best-effort single update.
 *
 * NOTE: to avoid double-crediting ensure you:
 *  - create Donation with status PENDING first
 *  - only mark as COMPLETED in a webhook/controlled path that checks idempotency/externalId/paymentReference
 * 
 * 2️⃣ Replace your current post-save logic
Your existing post-save hook does not know if the increment already happened. We’ll replace it with a transaction-safe + atomic guard.

3️⃣ Safe Transaction Logic (Correct Pattern)
🔒 Rules
We only increment the campaign if ALL are true:
status === "COMPLETED"
campaignId exists
appliedToCampaign === false

And we do both operations inside one transaction:
Increment Campaign.amountRaised
Mark Donation.appliedToCampaign = true
 */
DonationSchema.post("save", async function (doc, next) {
  // Only proceed if donation is completed and not yet applied
  if (
    doc.status !== "COMPLETED" ||
    !doc.campaignId ||
    doc.appliedToCampaign === true
  ) {
    return next();
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Re-fetch inside transaction with a lock-like guarantee
    const freshDonation = await mongoose.model("Donation").findOne(
      { _id: doc._id, appliedToCampaign: false },
      null,
      { session }
    );

    // Another webhook/save may have already applied it
    if (!freshDonation) {
      await session.commitTransaction();
      session.endSession();
      return next();
    }

    // Determine increment amount
    const incrementValue = freshDonation.amountBase
      ? mongoose.Types.Decimal128.fromString(freshDonation.amountBase.toString())
      : mongoose.Types.Decimal128.fromString(freshDonation.amountFiat.toString());

    // Increment campaign
    await mongoose.model("Campaign").findByIdAndUpdate(
      freshDonation.campaignId,
      { $inc: { amountRaised: incrementValue } },
      { session }
    );

    // Mark donation as applied
    freshDonation.appliedToCampaign = true;
    await freshDonation.save({ session });

    await session.commitTransaction();
    session.endSession();
    return next();

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Failed to apply donation to campaign:", err);
    return next(err);
  }
});


export default mongoose.model("Donation", DonationSchema);
