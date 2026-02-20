// routes/uploadRoutes.js
import express from "express";
import { protect, authorize } from "../middlewares/auth.js";
import {
  presignUpload,
  confirmUpload,
  createUploadFromMetadata,
  listUploadsForUser
} from "../controllers/uploadController.js";

const router = express.Router();

// Admin: list uploads for a user (KYC docs)
router.get("/", protect, authorize("ADMIN"), listUploadsForUser);

// Beneficiary documents
router.post("/presign", protect, presignUpload);

// Provider license
router.post("/confirm", protect, confirmUpload);

// Provider license
router.post("/metadata", protect, createUploadFromMetadata);

export default router;
