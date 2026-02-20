// backend/src/controllers/uploadController.js
import Upload from "../models/Upload.js";
import config from "../config/config.js";
// eslint-disable-next-line no-unused-vars
import generateUploadUrl from "../utils/s3.js";
const s3 = null; // Replace with actual S3 client when configured

export async function presignUpload(req, res, next) {
  try {
    const { fileName, mimeType, size, purpose = "other" } = req.body;
    if (!fileName || !mimeType) return res.status(400).json({ message: "fileName and mimeType required" });

    const upload = await Upload.create({
      userId: req.user.userId,
      purpose,
      name: fileName,
      mimeType,
      size,
      status: "pending"
    });

    const key = `uploads/${req.user.userId}/${upload._id}/${encodeURIComponent(fileName)}`;
    const params = { Bucket: config.S3_BUCKET, Key: key, ContentType: mimeType, Expires: 300 };
    const presignedUrl = await s3.getSignedUrlPromise("putObject", params);

    upload.key = key;
    await upload.save();

    res.json({ uploadId: upload._id, presignedUrl, key });
  } catch (err) { next(err); }
}

export async function confirmUpload(req, res, next) {
  try {
    const { uploadId } = req.body;
    const upload = await Upload.findById(uploadId);
    if (!upload || upload.userId.toString() !== req.user.userId) return res.status(400).json({ message: "Invalid upload" });

    // Optional: verify headObject
    const head = await s3.headObject({ Bucket: config.S3_BUCKET, Key: upload.key }).promise();
    upload.size = head.ContentLength;
    upload.url = `${config.S3_PUBLIC_BASE}/${upload.key}`; // or generate signed GET if private
    upload.status = "uploaded";
    await upload.save();

    res.json({ id: upload._id, url: upload.url, name: upload.name, mimeType: upload.mimeType });
  } catch (err) {
    next(err);
  }
}

export async function createUploadFromMetadata(req, res, next) {
  try {
    const { url, name, mimeType, purpose = "other", size } = req.body;
    if (!url || !name || !mimeType) return res.status(400).json({ message: "Missing fields" });

    const upload = await Upload.create({
      userId: req.user.userId,
      purpose,
      name,
      mimeType,
      url,
      size,
      status: "uploaded"
    });
    res.status(201).json({ id: upload._id, url: upload.url, name: upload.name, mimeType: upload.mimeType });
  } catch (err) { next(err); }
}

/** List uploads for a user (admin only) — for KYC document review */
export async function listUploadsForUser(req, res, next) {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ message: "userId query required" });
    const uploads = await Upload.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({ uploads: uploads.map((u) => ({ id: u._id, name: u.name, mimeType: u.mimeType, purpose: u.purpose, url: u.url, status: u.status, createdAt: u.createdAt })) });
  } catch (err) {
    next(err);
  }
}
