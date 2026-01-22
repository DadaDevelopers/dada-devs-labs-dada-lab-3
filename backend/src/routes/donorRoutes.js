import express from "express";
import {
  createDonor,
  getMyDonor,
  updateDonor,
  addPaymentMethod,
  listDonors,
  getDonorById,
  deleteDonor
} from "../controllers/donorController.js";

import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Donor self-service
router.post("/", protect, authorize("DONOR"), createDonor);
router.get("/me", protect, authorize("DONOR"), getMyDonor);
router.put("/me", protect, authorize("DONOR"), updateDonor);
router.post("/me/payment-methods", protect, authorize("DONOR"), addPaymentMethod);

// Admin
router.get("/", protect, authorize("ADMIN"), listDonors);
router.get("/:id", protect, authorize("ADMIN"), getDonorById);
router.delete("/:id", protect, authorize("ADMIN"), deleteDonor);

export default router;
