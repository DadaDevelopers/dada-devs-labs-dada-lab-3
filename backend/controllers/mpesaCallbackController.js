import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import Donation from "../models/Donation.js";

export async function mpesaCallbackController(req, res) {
  try {
    const stk = req.body?.Body?.stkCallback;
    if (!stk) return res.status(400).json({ message: "Invalid callback" });

    const checkoutId = stk.CheckoutRequestID;
    // find payment by provider+externalId
    const payment = await Payment.findOne({ provider: "MPESA", externalId: checkoutId });
    if (!payment) {
      // Optionally, create a Payment record if you want to accept callbacks for unknown ones
      return res.status(404).json({ message: "Payment not found" });
    }

    // idempotency: if already SUCCESS, respond 200
    if (payment.status === "SUCCESS" && stk.ResultCode === 0) {
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Save/capture raw payload and mpesa fields/INFO
    payment.processorResponse = req.body;
    payment.mpesa.resultCode = stk.ResultCode;
    payment.mpesa.resultDesc = stk.ResultDesc;

    if (stk.ResultCode === 0 && stk.CallbackMetadata?.Item) {
      const items = stk.CallbackMetadata.Item;
      payment.paymentReference = items.find(i => i.Name === "MpesaReceiptNumber")?.Value;
      payment.mpesa.transactionDate = items.find(i => i.Name === "TransactionDate")?.Value;
      payment.mpesa.receiptNumber = payment.paymentReference;
      payment.status = "SUCCESS";
    } else {
      payment.status = "FAILED";
    }

    // Use a transaction to update payment and donation atomically
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      await payment.save({ session });

       // Prepare payload for generic donation webhook
      const donationPayload = {
        donationId: payment.donationId,
        status: payment.status,
        externalId: payment.externalId,
        paymentReference: payment.paymentReference,
        processorResponse: payment.processorResponse,
        provider: "MPESA",
      };

      // Call the generic webhookHandler with the session
      await webhookHandler({ body: donationPayload, session }, res, () => {});

      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }

    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("mpesa callback error", err);
    return res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Error" });
  }
}

/* Transaction to update both Payment and Donation atomically. Also match on provider + externalId.
This prevents double-credit by checking payment.status before applying.
Would wish to add a payment.appliedToDonation boolean flag if you prefer explicit checks to prevent double increments in Campaign.*/