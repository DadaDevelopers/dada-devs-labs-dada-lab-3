import mongoose from "mongoose";
const { Schema } = mongoose;

const AllocationSchema = new Schema({
  provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
  campaign: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  amountSats: { type: Number, required: true },
  status: { type: String, enum: ["ACTIVE", "RELEASED"], default: "ACTIVE" },
  donationId: { type: Schema.Types.ObjectId, ref: "Donation" },
  createdAt: { type: Date, default: Date.now },
  releasedAt: { type: Date }
});

export default mongoose.model("Allocation", AllocationSchema);
