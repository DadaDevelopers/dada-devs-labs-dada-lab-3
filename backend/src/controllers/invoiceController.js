// src/controllers/invoiceController.js
import Invoice from "../models/Invoice.js";

// Create an invoice (MVP: campaignId, providerId, amount, currency, paymentMethod required; donationId/donorId optional)
export const createInvoice = async (req, res, next) => {
  try {
    const { donorId, donationId, campaignId, providerId, amount, currency, paymentMethod, transactionHash, invoiceFileUrl } = req.body;

    if (!campaignId || !providerId || !amount || !currency || !paymentMethod) {
      return res.status(400).json({ message: "Missing required fields: campaignId, providerId, amount, currency, paymentMethod" });
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const netAmount = amount;

    const invoice = await Invoice.create({
      invoiceNumber,
      donationId: donationId || undefined,
      campaignId,
      providerId,
      donorId: donorId || undefined,
      amount,
      currency,
      netAmount,
      paymentMethod,
      transactionHash,
      invoiceFileUrl: invoiceFileUrl || null
    });

    res.status(201).json({ invoice: invoice.toClient() });
  } catch (err) {
    next(err);
  }
};

// Get invoice by ID
export const getInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("donorId", "-passwordHash")
      .populate("campaignId")
      .populate("providerId");

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.json({ invoice: invoice.toClient() });
  } catch (err) { next(err); }
};

// List all invoices (with optional filters)
export const listInvoices = async (req, res, next) => {
  try {
    const { status, donorId, providerId, campaignId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (donorId) filter.donorId = donorId;
    if (providerId) filter.providerId = providerId;
    if (campaignId) filter.campaignId = campaignId;

    const invoices = await Invoice.find(filter)
      .populate("donorId", "-passwordHash")
      .populate("campaignId")
      .populate("providerId");

    res.json({ invoices: invoices.map(inv => inv.toClient()) });
  } catch (err) { next(err); }
};

// Update invoice status or file URL
export const updateInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    const { status, invoiceFileUrl } = req.body;
    if (status) invoice.status = status;
    if (invoiceFileUrl) invoice.invoiceFileUrl = invoiceFileUrl;

    await invoice.save();
    res.json({ invoice: invoice.toClient() });
  } catch (err) { next(err); }
};

// Delete an invoice
export const deleteInvoice = async (req, res, next) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted" });
  } catch (err) { next(err); }
};
