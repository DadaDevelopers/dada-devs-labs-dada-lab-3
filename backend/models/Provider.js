// src/models/Provider.js
import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Provider model
 *
 * - Holds provider metadata (business info) and payout destinations.
 * - Stores KYC/document references and KYC audit info.
 * - Keeps basic statistics (rating, totalReceived) for UI.
 * - Uses toJSON transform to avoid returning sensitive fields like full bank account numbers.
 *
 * NOTE: For real production you should encrypt sensitive fields (bank.accountNumber, idNumber)
 * using a field-level encryption library or store them in a secure vault (HashiCorp Vault / AWS KMS).
 */

const BankDetailsSchema = new Schema({
  currency: { type: String, default: "KES" },
  bankName: { type: String },
  accountName: { type: String },
  accountNumber: { type: String }, // consider encrypting
  branchCode: { type: String },
  swift: { type: String }, // optional for international payouts
  // mask helper: when exposing via API, return masked account number
}, { _id: false });

const MpesaDetailsSchema = new Schema({
  phone: { type: String }, // 2547XXXXXXXX
  tillOrPaybill: { type: String }, // if applicable
}, { _id: false });

const CryptoDestinationSchema = new Schema({
  network: { type: String }, // 'bitcoin','ethereum','lightning' ...
  address: { type: String }, // consider storing off-chain / encrypted
  label: { type: String } // e.g. "Primary BTC"
}, { _id: false });

const KycDocumentSchema = new Schema({
  type: { type: String }, // "ID", "BUSINESS_REG", "UTILITY_BILL"...
  url: { type: String },  // file store location (S3 path)
  uploadedAt: { type: Date, default: Date.now },
  verifiedAt: Date,
  verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  notes: String
}, { _id: false });

const ProviderSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },

  // Public profile
  businessName: { type: String, required: true, index: true },
  description: { type: String, default: null },
  email: { type: String, lowercase: true, index: true },
  phone: { type: String },

  // Contact / legal
  address: { type: String },
  registrationNumber: { type: String }, // business registration / tax id (sensitive)
  website: { type: String },

  // Payout destinations - support multiple methods per provider
  payoutMethods: [{
    method: { type: String, enum: ["MPESA","BANK","CRYPTO","CASH","OTHER"], required: true },
    active: { type: Boolean, default: true },

    // method-specific data:
    bank: { type: BankDetailsSchema, default: null },
    mpesa: { type: MpesaDetailsSchema, default: null },
    crypto: { type: [CryptoDestinationSchema], default: [] },

    note: String, // free text for each payout method
  }],

  // KYC & documents
  kycStatus: { type: String, enum: ["PENDING","APPROVED","REJECTED"], default: "PENDING", index: true },
  kycNotes: { type: String },
  kycDocuments: { type: [KycDocumentSchema], default: [] },

  // Relationship: campaigns (optional convenience array)
  campaigns: [{ type: Schema.Types.ObjectId, ref: "Campaign" }],

  // Stats & bookkeeping
  avgRating: { type: Number, default: 0 },
  totalDonationsReceived: { type: Schema.Types.Decimal128, default: 0 },

  // Soft delete / active
  isActive: { type: Boolean, default: true },
  disabledAt: Date,

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" } // who approved KYC
}, {
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true, versionKey: false }
});

// update updatedAt
ProviderSchema.pre("save", function(next){
  this.updatedAt = new Date();
  next();
});

/**
 * Mask sensitive fields in JSON output
 * - Masks bank account numbers (show last 3-4 digits)
 * - Does not remove KYC doc URLs (those are needed by admin UIs). Consider restricting further in public APIs.
 */
function maskAccountNumber(acc) {
  if (!acc) return acc;
  const s = String(acc);
  if (s.length <= 4) return "****";
  const last = s.slice(-4);
  return "****" + last;
}

ProviderSchema.methods.toClient = function() {
  const obj = this.toObject();

  // Mask payout bank account numbers
  if (Array.isArray(obj.payoutMethods)) {
    obj.payoutMethods = obj.payoutMethods.map(pm => {
      const copy = { ...pm };
      if (copy.bank && copy.bank.accountNumber) {
        copy.bank = { ...copy.bank, accountNumberMasked: maskAccountNumber(copy.bank.accountNumber) };
        // Optionally remove copy.bank.accountNumber entirely to avoid leaking
        delete copy.bank.accountNumber;
      }
      // For crypto, you might want to redact full address for public endpoints
      if (Array.isArray(copy.crypto) && copy.crypto.length) {
        copy.crypto = copy.crypto.map(c => ({ ...c, addressMasked: (c.address ? (c.address.slice(0,6) + "..." + c.address.slice(-4)) : null) }));
        copy.crypto.forEach(c => delete c.address); // remove raw address for safety in public responses
      }
      return copy;
    });
  }

  // Convert Decimal128 totalDonationsReceived to number
  if (obj.totalDonationsReceived) {
    try { obj.totalDonationsReceived = parseFloat(obj.totalDonationsReceived.toString()); } catch(e){ /* ignore */ }
  }

  return obj;
};

// Indexes (helpful queries)
ProviderSchema.index({ businessName: "text", email: 1, phone: 1 });
ProviderSchema.index({ kycStatus: 1, isActive: 1 });

export default mongoose.model("Provider", ProviderSchema);
