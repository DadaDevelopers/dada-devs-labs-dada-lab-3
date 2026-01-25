import express from "express";
import { protect } from "../middlewares/auth.js";
import { generateReceipt } from "../controllers/receiptController.js";

const router = express.Router();

// donationId is now a path param
router.get("/generate/:donationId", protect, generateReceipt);

export default router;
