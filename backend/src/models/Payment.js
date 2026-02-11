import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      index: true,
      required: true
    },

    provider: {
      type: String,
      //enum: ["MPESA", "BITCOIN", "LIGHTNING"],
      required: true
    },

    method: {
      type: String, // STK, CARD, USSD, ONCHAIN
      required: true
    },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },

    currency: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
      index: true
    },

    // -------- Provider identifiers ----------
    externalId: { type: String },        // CheckoutRequestID / PaymentIntentID
    paymentReference: { type: String },               // MpesaReceiptNumber
    idempotencyKey: { type: String, index: true },

    // -------- M-PESA specific ----------
    mpesa: {
      phone: String,
      merchantRequestId: String,
      checkoutRequestId: String,
      receiptNumber: String,
      transactionDate: String,
      resultCode: Number,
      resultDesc: String
    },

    bitcoin: {
    address: String,
    txHash: String,
    confirmations: { type: Number, default: 0 }
  },

  lightning: {
    invoice: String,
    paymentHash: String,
    //settled: Boolean
    settled: { type: Boolean, default: false },
    expiresAt: Date
  },
    
    processorResponse: Object, // raw payload
    error: Object
  },
  { timestamps: true }
);

// After schema definition, before export - Adding a compound unique sparse index for provider + externalId to prevent duplicates
/*Rationale: externalId alone may not be globally unique across providers. Compound index prevents duplicate Payments from the same provider. */
//paymentSchema.index({ provider: 1, externalId: 1 }, { unique: true, sparse: true });

paymentSchema.index(
  { provider: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: { externalId: { $exists: true, $ne: null } }
  }
);


export default mongoose.model("Payment", paymentSchema);

/* Supports ALL providers
One donation → many payments (retries, refunds)
Keeps Donation clean */