// src/services/lightning.service.js
import crypto from "crypto";
/**
 * Lightning service abstraction
 * Later can plug into:
 * - LNBits
 * - OpenNode
 * - Voltage
 * - BTCPay
 */

/*export const createLightningInvoice = async ({ amountFiat, memo }) => {
  // Convert fiat → sats using exchange rate service in future
  const sats = 1500;

  return {
    bolt11: "lnbc1500n1exampleinvoicexxxxxxxxxxxx",
    payment_hash: "examplepaymenthash1234567890",
    sats,
    memo
  };
};*/

/**
 * Create Lightning invoice
 * Lightning service abstraction
 * Expects sats already calculated & stored on Donation
 */
export const createLightningInvoice = async ({ amountSats, memo }) => {
  return {
    invoice: `lnbc${amountSats}${crypto.randomBytes(8).toString("hex")}`,
    paymentHash: crypto.randomBytes(32).toString("hex"),
    amountSats,
    memo
  };
};