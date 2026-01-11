// src/models/Invoice.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, unique: true, required: true }, // e.g., INV-20251212-001
  donationId: { type: Schema.Types.ObjectId, ref: "Donation", required: true },
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
  donorId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  invoiceFileUrl: { type: String, default: null },

  // Amounts
  amount: { type: Schema.Types.Decimal128, required: true }, // base amount in donor currency
  currency: { type: String, required: true },               // donor currency (KES, USD, EUR)
  fees: { type: Schema.Types.Decimal128, default: 0 },
  netAmount: { type: Schema.Types.Decimal128, required: true }, // amount after fees

  // Payment info
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ["MPESA","BANK","STRIPE","CARD","BITCOIN","LIGHTNING","CASH","OTHER"] 
  },
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

// Update updatedAt automatically
InvoiceSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
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
