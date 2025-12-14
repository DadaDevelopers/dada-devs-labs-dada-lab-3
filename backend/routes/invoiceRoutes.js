// src/routes/invoiceRoutes.js
import express from "express";
import {
  createInvoice,
  getInvoice,
  listInvoices,
  updateInvoice,
  deleteInvoice
} from "../controllers/invoiceController.js";
import { protect, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Create invoice (admin or provider)
router.post("/", protect, authorize("ADMIN","PROVIDER"), createInvoice);

// List invoices (admin only)
router.get("/", protect, authorize("ADMIN"), listInvoices);

// Get invoice by ID
router.get("/:id", protect, authorize("ADMIN","PROVIDER","DONOR"), getInvoice);

// Update invoice (status or file URL)
router.put("/:id", protect, authorize("ADMIN","PROVIDER"), updateInvoice);

// Delete invoice
router.delete("/:id", protect, authorize("ADMIN"), deleteInvoice);

export default router;
