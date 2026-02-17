// models/CampaignReport.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const CampaignReportSchema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", index: true },
    beneficiaryId: { type: Schema.Types.ObjectId, ref: "User" },
    description: { type: String, required: true },
    reportType: { type: String, enum: ["interim", "final"], required: true },
    uploadIds: [{ type: Schema.Types.ObjectId, ref: "Upload" }],
    status: {
      type: String,
      enum: ["submitted", "reviewed"],
      default: "submitted"
    }
  },
  { timestamps: true }
);

export default mongoose.model("CampaignReport", CampaignReportSchema);
