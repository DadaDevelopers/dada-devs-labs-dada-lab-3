// src/models/Invoice.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, unique: true, required: true }, // e.g., INV-20251212-001
  donationId: { type: Schema.Types.ObjectId, ref: "Donation", required: false }, // optional for provider-issued campaign invoice (MVP)
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
  donorId: { type: Schema.Types.ObjectId, ref: "User", required: false }, // optional for MVP

  invoiceFileUrl: { type: String, default: null },

  // Amounts
  amount: { type: Schema.Types.Decimal128, required: true }, // base amount in donor currency
  currency: { type: String, required: true },               // donor currency (KES, USD, EUR)
  fees: { type: Schema.Types.Decimal128, default: 0 },
  netAmount: { type: Schema.Types.Decimal128, required: false }, // amount after fees; default from amount if not set

  // Payment info
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ["MPESA","BANK","STRIPE","CARD","BITCOIN","LIGHTNING","CASH","OTHER"] 
  },
  lightningAddress: { type: String }, // when paymentMethod is LIGHTNING (from payouts or invoice form)
  btcAddress: { type: String },       // when paymentMethod is BITCOIN (from payouts or invoice form)
  paymentReference: { type: String }, // provider reference
  paymentDate: { type: Date, default: Date.now },

  // Status
  status: { 
    type: String, 
    enum: ["PENDING","PAID","FAILED","REFUNDED"], 
    default: "PENDING" 
  },

  // Metadata / optional fields
  description: { type: String },    // e.g., "Donation to campaign X"
  issuedBy: { type: String },       // e.g., "DirectAid System"
  issuedAt: { type: Date, default: Date.now },
  notes: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt automatically (Mongoose 9+ no longer passes next to pre hooks)
InvoiceSchema.pre("save", function() {
  this.updatedAt = new Date();
});

// Convert Decimal128 to number for API responses
InvoiceSchema.methods.toClient = function() {
  const obj = this.toObject({ getters: true, virtuals: false });
  const convertDecimal = (d) => d ? parseFloat(d.toString()) : d;
  obj.amount = convertDecimal(obj.amount);
  obj.fees = convertDecimal(obj.fees);
  obj.netAmount = convertDecimal(obj.netAmount);
  return obj;
};

export default mongoose.model("Invoice", InvoiceSchema);
