import mongoose from "mongoose";
const { Schema } = mongoose;

const PayoutMethodSchema = new Schema({
  type: {
    type: String,
    enum: ["LIGHTNING", "BANK", "MPESA", "STRIPE"],
    required: true
  },
  details: { type: Schema.Types.Mixed }, // method-specific, tokenized
  displayLabel: { type: String },
  isDefault: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
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
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  // Top-level provider identity
  organizationName: { type: String, required: true },
  organizationType: {
    type: String,
    enum: ["Hospital", "Clinic", "Pharmacy", "School", "NGO", "Supplier", "Other"],
    default: "Other"
  },
  publicId: { type: String, unique: true, index: true },
  slug: { type: String, unique: true, index: true },
  description: { type: String, maxlength: 3000 },
  logoUpload: { type: Schema.Types.ObjectId, ref: "Upload" },
  websiteUrl: { type: String },
  // Contact
  contactEmail: { type: String },
  contactPhone: { type: String },
  address: {
    line1: { type: String },
    city: { type: String },
    country: { type: String },
    postal: { type: String }
  },
  country: { type: String },
  city: { type: String },
  // Compliance / KYC
  businessRegNumber: { type: String },
  registrationDocs: [{ type: Schema.Types.ObjectId, ref: "Upload" }],
  licenseDocs: [{ type: Schema.Types.ObjectId, ref: "Upload" }],
  taxId: { type: String }, // encrypted in production
  kyc: {
    status: { type: String, enum: ["NOT_REQUIRED", "PENDING", "APPROVED", "REJECTED"], default: "NOT_REQUIRED" },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectionReason: { type: String }
  },
  // Payout & financial routing
  payoutMethods: [PayoutMethodSchema],
  bankAccountName: { type: String }, // encrypted in production
  bankAccountNumberLast4: { type: String },
  bankProviderToken: { type: String },
  lightning: {
    nodeType: { type: String, enum: ["LND", "CLN", "LNBits", "Custodial"] },
    nodeAlias: { type: String },
    nodePubKey: { type: String, required: true },
    lnurlWithdraw: { type: String },
    lnAddress: { type: String },
    withdrawalMode: { type: String, enum: ["MANUAL", "AUTO"] },
    minWithdrawalSats: { type: Number },
    maxWithdrawalSats: { type: Number },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  },
  // Service & campaign linkage
  serviceTypes: [{ type: String }],
  serviceCatalog: [
    {
      code: { type: String },
      title: { type: String },
      description: { type: String },
      priceSats: { type: Number },
      pricingModel: { type: String, enum: ["FIXED", "ESTIMATE"] },
      currency: { type: String },
      unit: { type: String },
      docsRequired: [{ type: String }],
      active: { type: Boolean, default: true }
    }
  ],
  availability: {
    online: { type: Boolean },
    regions: [{ type: String }]
  },
  // Operational & support
  accountManager: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  sla: { type: String },
  // Campaigns handled by provider
  campaigns: [{ type: Schema.Types.ObjectId, ref: "Campaign" }],
  // Admin & audit
  auditLog: [{ type: Schema.Types.ObjectId, ref: "ActivityLog" }],
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

  // Mask bank account numbers
  if (Array.isArray(obj.payoutMethods)) {
    obj.payoutMethods = obj.payoutMethods.map(pm => {
      if (pm.accountNumber) {
        pm.accountNumberMasked =
          "****" + pm.accountNumber.slice(-4);
        delete pm.accountNumber;
      }
      return pm;
    });
  }

  return obj;
};

export default mongoose.model("Provider", ProviderSchema);
