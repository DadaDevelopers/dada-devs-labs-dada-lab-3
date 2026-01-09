// src/utils/stripe.js
//PaymentIntents + webhooks
import Stripe from "stripe";
import config from "../config/config.js";

const stripe = new Stripe(config.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

export async function createPaymentIntent({ amountCents, currency = "usd", metadata = {} }) {
  // amountCents is integer (e.g., 1000 = $10.00)
  const pi = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: currency.toLowerCase(),
    metadata,
    automatic_payment_methods: { enabled: true },
  });
  return pi;
}

export function constructEvent(payload, sigHeader) {
  const webhookSecret = config.STRIPE_WEBHOOK_SECRET;
  return stripe.webhooks.constructEvent(payload, sigHeader, webhookSecret);
}

export default stripe;
