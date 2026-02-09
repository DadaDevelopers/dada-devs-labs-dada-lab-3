import Donation from "../models/Donation.js";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

export const getDonorMetrics = async (req, res, next) => {
  try {
    const donorId = req.user.userId;

    const donations = await Donation.find({
      donorId,
      status: "COMPLETED"
    });

    let totalFiat = 0;
    let totalSats = 0;
    const campaigns = new Set();

    donations.forEach(d => {
      totalFiat += parseFloat(d.amountFiat.toString());
      if (d.amountSats) totalSats += Number(d.amountSats);
      if (d.campaignId) campaigns.add(d.campaignId.toString());
    });

    res.json({
      metrics: {
        totalDonatedFiat: totalFiat,
        totalDonatedSats: totalSats,
        campaignsSupported: campaigns.size,
        donationsCount: donations.length,
        impactScore: false // frontend toggle
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/donors/receipts/:id/pdf
 */
export const getReceiptPDF = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donorId", "firstName lastName email")
      .populate("campaignId", "title");

    if (!donation) return res.status(404).end();

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(18).text("DirectAid Donation Receipt");
    doc.moveDown();
    doc.text(`Donor: ${donation.donorId.firstName} ${donation.donorId.lastName}`);
    doc.text(`Amount: ${donation.amountFiat} ${donation.currency}`);
    doc.text(`Campaign: ${donation.campaignId?.title || "General"}`);
    doc.text(`Date: ${donation.createdAt}`);

    doc.end();
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/donors/receipts/:id/email
 */
export const emailReceipt = async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donorId", "email");

    const transporter = nodemailer.createTransport({ sendmail: true });

    await transporter.sendMail({
      to: donation.donorId.email,
      subject: "Your DirectAid Donation Receipt",
      text: `Thank you for donating ${donation.amountFiat} ${donation.currency}`
    });

    res.json({ sent: true });
  } catch (err) {
    next(err);
  }
};