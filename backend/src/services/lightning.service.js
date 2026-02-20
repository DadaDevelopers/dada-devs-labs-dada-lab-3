// src/services/lightning.service.js
/**
 * Lightning service: real BOLT11 invoices via LNBits (or stub when not configured).
 * Set LNBITS_URL and LNBITS_INVOICE_KEY to enable real invoices.
 * - LNBITS_URL: e.g. https://legend.lnbits.com
 * - LNBITS_INVOICE_KEY: Invoice/Read API key from the wallet (creates receive invoices)
 */

const LNBITS_URL = (process.env.LNBITS_URL || "").replace(/\/$/, "");
const LNBITS_INVOICE_KEY = (process.env.LNBITS_INVOICE_KEY || "").trim();
const LNBITS_ADMIN_KEY = (process.env.LNBITS_ADMIN_KEY || "").trim(); // Required for sending (outbound) payments
const DEMO_MODE = /^(1|true|yes)$/i.test(process.env.LIGHTNING_DEMO_MODE || "");
// Public URL of this backend so LNBits can POST when invoice is paid (e.g. https://your-api.com)
const BACKEND_PUBLIC_URL = (process.env.BACKEND_PUBLIC_URL || process.env.BACKEND_URL || "").replace(/\/$/, "");

const isConfigured = () => Boolean(LNBITS_URL && LNBITS_INVOICE_KEY);
// Pay is configured if we have URL and at least one key (Admin preferred; will try Invoice as fallback and surface clear error)
export const isPayConfigured = () => Boolean(LNBITS_URL && (LNBITS_ADMIN_KEY || LNBITS_INVOICE_KEY));

/**
 * Create Lightning invoice (real BOLT11 via LNBits when configured).
 * When LNBits is not set, returns 503 unless LIGHTNING_DEMO_MODE=true (then returns a stub for local testing).
 * @param {{ amountFiat?: number, amountSats?: number, memo?: string }}
 * @returns {{ bolt11: string, payment_hash: string, amountSats: number, memo?: string, demoInvoice?: boolean }}
 */
export const createLightningInvoice = async ({ amountFiat, amountSats, memo }) => {
  const sats = amountSats || Math.round(parseFloat(amountFiat) * 2500);
  if (sats < 1) throw new Error("Amount must be at least 1 sat");

  if (isConfigured()) {
    const res = await fetch(`${LNBITS_URL}/api/v1/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": LNBITS_INVOICE_KEY,
      },
      body: JSON.stringify({
        out: false,
        amount: sats,
        memo: memo || "Donation",
        expiry: 3600,
        ...(BACKEND_PUBLIC_URL && {
          webhook: `${BACKEND_PUBLIC_URL}/api/donations/webhooks/lightning`,
        }),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`LNBits invoice failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const bolt11 = data.payment_request;
    const rawHash = data.payment_hash;
    if (!bolt11 || !rawHash) {
      throw new Error("LNBits did not return payment_request or payment_hash");
    }
    const payment_hash = String(rawHash).trim().toLowerCase();

    return {
      bolt11,
      payment_hash,
      amountSats: sats,
      memo,
    };
  }

  // Demo mode: return a placeholder so the UI flow works locally (QR will not work in real wallets)
  if (DEMO_MODE) {
    const crypto = await import("crypto");
    return {
      bolt11: `lnbc${sats}n1demo${crypto.randomBytes(16).toString("hex")}`, // clearly not a valid BOLT11
      payment_hash: crypto.randomBytes(32).toString("hex"),
      amountSats: sats,
      memo,
      demoInvoice: true,
    };
  }

  throw new Error(
    "Lightning is not configured. Set LNBITS_URL and LNBITS_INVOICE_KEY for real invoices, or LIGHTNING_DEMO_MODE=true for local testing."
  );
};

/**
 * Check with LNBits whether an invoice (by payment_hash) has been paid.
 * Used when polling donation status so we can mark COMPLETED without relying on webhook (e.g. localhost).
 * @param {string} paymentHash
 * @returns {Promise<boolean>} true if paid
 */
export const checkPaymentStatus = async (paymentHash) => {
  if (!isConfigured() || !paymentHash) return false;
  // Normalize to lowercase hex (LNBits may be case-sensitive on the path)
  const hash = String(paymentHash).trim().toLowerCase();
  if (!hash) return false;
  const url = `${LNBITS_URL}/api/v1/payments/${encodeURIComponent(hash)}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-Api-Key": LNBITS_INVOICE_KEY,
        "Content-Type": "application/json",
      },
    });
    const text = await res.text();
    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[LNBits] GET payment status:", res.status, url.replace(LNBITS_INVOICE_KEY, "***"), text?.slice(0, 300));
      }
      return false;
    }
    if (!text) return false;
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return false;
    }
    // Paid if: paid flag is true, status is paid/complete, OR preimage is present (in Lightning, preimage is only revealed when payment is settled)
    const hasPreimage = typeof data?.preimage === "string" && data.preimage.trim().length >= 32;
    const paid =
      data?.paid === true ||
      data?.paid === "true" ||
      (typeof data?.paid === "boolean" && data.paid) ||
      data?.details?.paid === true ||
      String(data?.status || "").toLowerCase() === "paid" ||
      String(data?.status || "").toLowerCase() === "complete" ||
      hasPreimage;
    if (process.env.NODE_ENV !== "production") {
      console.log("[LNBits] GET payment response: paid=" + data?.paid + " status=" + data?.status + " preimage=" + (hasPreimage ? "yes" : "no") + " -> paid=" + paid);
    }
    return paid;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[LNBits] checkPaymentStatus error:", err.message);
    }
    return false;
  }
};

/**
 * Resolve a Lightning address (user@domain.com) to a BOLT11 invoice via LNURL-pay.
 * @param {string} lightningAddress - e.g. "user@getalby.com"
 * @param {number} amountSats
 * @returns {Promise<{ bolt11: string, paymentHash?: string }>}
 */
export const getInvoiceFromLightningAddress = async (lightningAddress, amountSats) => {
  const addr = String(lightningAddress || "").trim().toLowerCase();
  if (!addr || !addr.includes("@")) {
    throw new Error("Invalid Lightning address (expected user@domain.com)");
  }
  const [username, domain] = addr.split("@");
  if (!domain || !username) throw new Error("Invalid Lightning address");
  const millisats = Math.round(Number(amountSats) * 1000);
  if (millisats < 1000) throw new Error("Amount must be at least 1 sat");

  const lnurlpUrl = `https://${domain}/.well-known/lnurlp/${encodeURIComponent(username)}`;
  const metaRes = await fetch(lnurlpUrl);
  if (!metaRes.ok) {
    throw new Error(`Lightning address lookup failed: ${metaRes.status} ${await metaRes.text().catch(() => "")}`);
  }
  const meta = await metaRes.json();
  const callback = meta?.callback;
  const min = Number(meta?.minSendable) ?? 1000;
  const max = Number(meta?.maxSendable) ?? 1e12;
  if (!callback) throw new Error("Lightning address did not return a callback URL");
  if (millisats < min || millisats > max) {
    throw new Error(`Amount ${amountSats} sats (${millisats} msats) outside allowed range ${min}-${max} msats`);
  }

  const sep = callback.includes("?") ? "&" : "?";
  const invoiceUrl = `${callback}${sep}amount=${millisats}`;
  const invRes = await fetch(invoiceUrl);
  if (!invRes.ok) {
    throw new Error(`Invoice request failed: ${invRes.status} ${await invRes.text().catch(() => "")}`);
  }
  const invData = await invRes.json();
  const bolt11 = invData?.pr;
  if (!bolt11) throw new Error("No invoice (pr) in Lightning address response");
  return {
    bolt11,
    paymentHash: invData?.paymentHash,
  };
};

/**
 * Pay a BOLT11 invoice via LNBits (outbound). Uses LNBITS_ADMIN_KEY; falls back to LNBITS_INVOICE_KEY (may 403).
 * @param {string} bolt11
 * @param {{ maxFee?: number }} opts
 * @returns {Promise<{ paymentHash: string, paid: boolean }>}
 */
export const payBolt11 = async (bolt11, opts = {}) => {
  if (!isPayConfigured()) {
    throw new Error("Lightning pay not configured. Set LNBITS_URL and LNBITS_ADMIN_KEY (or LNBITS_INVOICE_KEY) to send payments.");
  }
  const payKey = LNBITS_ADMIN_KEY || LNBITS_INVOICE_KEY;
  const res = await fetch(`${LNBITS_URL}/api/v1/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": payKey,
    },
    body: JSON.stringify({
      out: true,
      bolt11: String(bolt11).trim(),
      ...(opts.maxFee != null && { max_fee: opts.maxFee }),
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    if (res.status === 403 && text.includes("Invoice (or Admin) key required")) {
      throw new Error(
        "LNBits requires the Admin key for sending payments. You are likely using the Invoice key. " +
        "In LNBits open your wallet → API info (or wallet settings) and copy the \"Admin\" key. " +
        "Set it in backend .env as LNBITS_ADMIN_KEY=your_admin_key (restart backend after)."
      );
    }
    throw new Error(`LNBits pay failed: ${res.status} ${text}`);
  }
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid LNBits pay response");
  }
  const paymentHash = data?.payment_hash ?? data?.paymentHash;
  const paid = data?.payment_hash != null; // LNBits returns payment_hash when payment is sent
  return { paymentHash: paymentHash || "", paid };
};

/**
 * Pay to a Lightning address (resolve LNURL-pay then pay the invoice).
 * @param {string} lightningAddress - e.g. "user@getalby.com"
 * @param {number} amountSats
 * @returns {Promise<{ paymentHash: string, paid: boolean }>}
 */
export const payToLightningAddress = async (lightningAddress, amountSats) => {
  const sats = Math.round(Number(amountSats));
  if (sats < 1) throw new Error("Amount must be at least 1 sat");
  const { bolt11 } = await getInvoiceFromLightningAddress(lightningAddress, sats);
  return payBolt11(bolt11);
};
