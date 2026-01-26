// src/utils/stripe.js
import Stripe from "stripe";
import config from "../config/config.js";

let stripeInstance = null;

/**
 * Lazily initialize Stripe only when needed
 */
export function getStripe() {
  if (!config.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(config.STRIPE_SECRET_KEY, {
      apiVersion: "2022-11-15"
    });
  }

  return stripeInstance;
}

/**
 * Create PaymentIntent (safe lazy init)
 */
export async function createPaymentIntent({ amountCents, currency = "usd", metadata = {} }) {
  const stripe = getStripe();
  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: currency.toLowerCase(),
    metadata,
    automatic_payment_methods: { enabled: true }
  });
}

/**
 * Verify webhook event (safe lazy init)
 */
export function constructEvent(payload, sigHeader) {
  const stripe = getStripe();
  const webhookSecret = config.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  return stripe.webhooks.constructEvent(payload, sigHeader, webhookSecret);
}
