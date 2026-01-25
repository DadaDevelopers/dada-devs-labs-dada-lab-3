import mongoose from "mongoose";
const { Schema } = mongoose;

const PaymentMethodSchema = new Schema({
  method: {
    type: String,
    enum: ["MPESA", "LIGHTNING", "BITCOIN"], // updated methods
    required: true
  },

  // MPESA
  mpesaPhone: String,

  // Lightning Network
  lightningInvoice: String, // or wallet public key
  lightningLabel: String,   // optional label/note

  // Bitcoin on-chain
  btcAddress: String,
  btcLabel: String,         // optional label/note

  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const DonorSchema = new Schema({

  // Identity
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true
  },

  // Public profile
  displayName: { type: String },
  email: { type: String },
  phone: { type: String },
  country: { type: String },

  // Preferences
  anonymousByDefault: { type: Boolean, default: false },
  receiveUpdates: { type: Boolean, default: true },
  receiveReceipts: { type: Boolean, default: true },

  // Financial
  paymentMethods: [PaymentMethodSchema],

  // Stats
  totalDonated: {
    type: Schema.Types.Decimal128,
    default: 0
  },
  donationCount: {
    type: Number,
    default: 0
  },

  // Relations
  donations: [{
    type: Schema.Types.ObjectId,
    ref: "Donation"
  }],

  // Trust / compliance
  kycStatus: {
    type: String,
    enum: ["NONE", "PENDING", "APPROVED", "REJECTED"],
    default: "NONE"
  },

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

});

// Auto-update timestamp
DonorSchema.pre("save", function () {
  this.updatedAt = new Date();
});

// Safe API output
DonorSchema.methods.toClient = function () {
  const obj = this.toObject({ versionKey: false });

  if (obj.totalDonated) {
    obj.totalDonated = parseFloat(obj.totalDonated.toString());
  }

  // Mask sensitive info
  if (Array.isArray(obj.paymentMethods)) {
    obj.paymentMethods = obj.paymentMethods.map(pm => {
      if (pm.mpesaPhone) pm.mpesaPhone = "****" + pm.mpesaPhone.slice(-3);
      if (pm.btcAddress) pm.btcAddress = pm.btcAddress.slice(0, 6) + "..." + pm.btcAddress.slice(-4);
      if (pm.lightningInvoice) pm.lightningInvoice = pm.lightningInvoice.slice(0, 6) + "..." + pm.lightningInvoice.slice(-6);
      return pm;
    });
  }

  return obj;
};

export default mongoose.model("Donor", DonorSchema);
