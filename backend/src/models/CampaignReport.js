import mongoose from "mongoose";
const { Schema } = mongoose;

const CampaignReportSchema = new Schema({
  campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
  beneficiaryId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String },
  uploadIds: [{ type: Schema.Types.ObjectId, ref: "Upload" }],
  reportType: { type: String, enum: ["interim", "final"], required: true },
  status: { type: String, enum: ["submitted", "reviewed", "rejected"], default: "submitted" },
  submittedAt: { type: Date, default: Date.now }
});

CampaignReportSchema.index({ campaignId: 1, beneficiaryId: 1, reportType: 1 });

export default mongoose.model("CampaignReport", CampaignReportSchema);
