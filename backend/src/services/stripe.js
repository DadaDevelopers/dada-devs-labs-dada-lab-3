// src/utils/stripe.js
//PaymentIntents + webhooks
// import Stripe from 'stripe';
// import dotenv from 'dotenv';
// dotenv.config();

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Commented out for development, add your key in .env when ready
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

// export default stripe; // Disabled: stripe is not defined when commented out for development
