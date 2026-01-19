// routes/uploadRoutes.js
import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  presignUpload,
  confirmUpload,
  createUploadFromMetadata
} from "../controllers/uploadController.js";

const router = express.Router();

// Beneficiary documents
router.post("/presign", protect, presignUpload);

// Provider license
router.post("/confirm", protect, confirmUpload);

// Provider license
router.post("/metadata", protect, createUploadFromMetadata);

export default router;
