//Dispute handling (Donations and Payouts)
const DisputeSchema = new mongoose.Schema({
  entityType: { type: String, enum: ["DONATION", "PAYOUT"] },
  entityId: { type: mongoose.Schema.Types.ObjectId },

  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reason: String,

  status: {
    type: String,
    enum: ["OPEN", "UNDER_REVIEW", "RESOLVED", "REJECTED"],
    default: "OPEN"
  },

  resolution: {
    action: { type: String, enum: ["REFUND", "RELEASE", "NONE"] },
    notes: String
  }
}, { timestamps: true });

/*Effect : Locks funds, Freezes payout/refund, Requires admin resolution */