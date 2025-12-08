import { Request, Response, NextFunction } from "express";
import * as invoiceService from "../services/invoice.service";

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.createInvoice(req.body, req.user);
    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};

export const updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body, req.user);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
};
