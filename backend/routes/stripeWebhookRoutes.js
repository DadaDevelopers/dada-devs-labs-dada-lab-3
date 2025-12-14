import express from "express";
import { stripeWebhookController } from "../controllers/stripeWebhookController.js";
const router = express.Router();
router.post("/", stripeWebhookController);
export default router;
