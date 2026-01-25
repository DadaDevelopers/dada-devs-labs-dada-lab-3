import mongoose from "mongoose";
import PDFDocument from "pdfkit";
import DonationM from "../models/DonorDonation.js";
import Receipt from "../models/Receipt.js";

export const generateReceipt = async (req, res, next) => {
  try {
    const { donationId } = req.params; // <-- from path now

    if (!donationId)
      return res.status(400).json({ message: "donationId is required" });

    if (!mongoose.Types.ObjectId.isValid(donationId))
      return res.status(400).json({ message: "Invalid donationId format" });

    const donation = await DonationM.findById(donationId);

    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    // build receipt object
    const receiptData = {
      donation: donation._id,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      paymentMethod: donation.paymentMethod,
      amount: donation.amount,
      currency: donation.currency,
      lightningInvoice: null,
      bitcoinAddress: null,
      mpesaCheckoutId: null,
    };


    if (donation.paymentMethod === "LIGHTNING") {
      receiptData.lightningInvoice = donation.lightningInvoice;
    } else if (donation.paymentMethod === "BITCOIN") {
      receiptData.bitcoinAddress = donation.bitcoinAddress;
    } else if (donation.paymentMethod === "MPESA") {
      receiptData.mpesaCheckoutId = donation.checkoutId;
    }

    // save receipt
    const receipt = await Receipt.create(receiptData);

    // generate PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${donationId}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(20).text("Donation Receipt", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Receipt ID: ${receipt._id}`);
    doc.text(`Donation ID: ${donation._id}`);
    doc.text(`Issued At: ${receipt.issuedAt}`);
    doc.moveDown();

    doc.text(`Donor Name: ${receipt.donorName}`);
    doc.text(`Donor Email: ${receipt.donorEmail}`);
    doc.moveDown();

    doc.text(`Payment Method: ${receipt.paymentMethod}`);
    doc.text(`Amount: ${receipt.amount} ${receipt.currency}`);
    doc.moveDown();

    if (receipt.paymentMethod === "LIGHTNING") {
      doc.text(`Lightning Invoice: ${receipt.lightningInvoice}`);
    } else if (receipt.paymentMethod === "BTC") {
      doc.text(`Bitcoin Address: ${receipt.bitcoinAddress}`);
    } else if (receipt.paymentMethod === "MPESA") {
      doc.text(`MPESA Checkout ID: ${receipt.mpesaCheckoutId}`);
    }

    doc.end(); // finalize PDF
  } catch (err) {
    next(err);
  }
};
