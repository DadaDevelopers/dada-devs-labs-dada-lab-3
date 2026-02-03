// backend/src/models/Upload.js
import mongoose from "mongoose";
const { Schema } = mongoose;

const UploadSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  purpose: { type: String, enum: ["provider_license","beneficiary_doc","other"], default: "other", index: true },
  name: String,
  mimeType: String,
  url: String,
  key: String, // s3 key
  size: Number,
  status: { type: String, enum: ["pending","uploaded","verified","rejected"], default: "pending", index: true },
  verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  verifiedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

UploadSchema.index({ userId: 1, purpose: 1 });

export default mongoose.model("Upload", UploadSchema);
