import express from "express";
import {
  getProviderByUser,
  createProvider,
  updateProvider,
  getProviderById,
  listProviders,
  approveKYC,
  addPayoutMethod,
  requestPayout,
  deleteProvider
} from "../controllers/providerController.js";

import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Provider self-service
router.post("/", protect, authorize("PROVIDER", "ADMIN"), createProvider);
router.get("/me", protect, authorize("PROVIDER"), getProviderByUser);
router.put("/me", protect, authorize("PROVIDER"), updateProvider);

router.post("/me/payout-methods", protect, authorize("PROVIDER"), addPayoutMethod);
router.post("/me/request-payout", protect, authorize("PROVIDER"), requestPayout);

// Admin
router.get("/", protect, authorize("ADMIN"), listProviders);
router.get("/:id", protect, authorize("ADMIN"), getProviderById);
router.put("/:id/kyc", protect, authorize("ADMIN"), approveKYC);
router.delete("/:id", protect, authorize("ADMIN"), deleteProvider);

export default router;
