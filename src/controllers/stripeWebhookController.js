// src/controllers/stripeWebhookController.js
import Payment from "../models/Payment.js";
import { webhookHandler } from "./donationController.js";
import { constructEvent } from "../services/stripe.js";
import mongoose from "mongoose";

export const stripeWebhookController = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = constructEvent(req.body, sig);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const pi = event.data.object;
    const payment = await Payment.findOne({ provider: "STRIPE", externalId: pi.id });
    if (!payment) return res.status(404).send("Payment not found");

    payment.processorResponse = pi;
    payment.status = event.type === "payment_intent.succeeded" ? "SUCCESS" : "FAILED";
    await payment.save();

    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const donationPayload = {
        donationId: payment.donationId,
        status: payment.status,
        externalId: payment.externalId,
        paymentReference: payment.paymentReference,
        processorResponse: pi,
        provider: "STRIPE",
        transactionHash: pi.latest_charge || null
      };
      await webhookHandler({ body: donationPayload, session }, res, () => {});
      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    res.status(500).send();
  }
};
