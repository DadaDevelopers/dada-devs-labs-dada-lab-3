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
export const createLightningInvoice = async ({ amountFiat, amountSats, memo }) => {
  // Use provided sats or convert from fiat (rough conversion: $1 = 2500 sats)
  const sats = amountSats || Math.round(parseFloat(amountFiat) * 2500);

  return {
    bolt11: `lnbc${sats}${crypto.randomBytes(8).toString("hex")}`,
    payment_hash: crypto.randomBytes(32).toString("hex"),
    amountSats: sats,
    memo
  };
};