import mongoose from "mongoose";
const { Schema } = mongoose;

const PaymentMethodSchema = new Schema({
  method: {
    type: String,
    enum: ["MPESA", "CARD", "BANK"],
    required: true
  },

  // MPESA
  mpesaPhone: String,

  // CARD (future)
  cardLast4: String,
  cardBrand: String,

  // BANK (future)
  bankName: String,
  accountName: String,
  accountNumber: String,

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
DonorSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Safe API output
DonorSchema.methods.toClient = function () {
  const obj = this.toObject({ versionKey: false });

  // Convert Decimal128
  if (obj.totalDonated) {
    obj.totalDonated = parseFloat(obj.totalDonated.toString());
  }

  // Mask bank numbers
  if (Array.isArray(obj.paymentMethods)) {
    obj.paymentMethods = obj.paymentMethods.map(pm => {
      if (pm.accountNumber) {
        pm.accountNumberMasked = "****" + pm.accountNumber.slice(-4);
        delete pm.accountNumber;
      }
      return pm;
    });
  }

  return obj;
};

export default mongoose.model("Donor", DonorSchema);
