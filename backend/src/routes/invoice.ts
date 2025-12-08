import { Router } from "express";
import * as invoiceController from "../controllers/invoice.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, invoiceController.createInvoice);
router.get("/:id", invoiceController.getInvoiceById);
router.patch("/:id", authMiddleware, invoiceController.updateInvoice);

export default router;
