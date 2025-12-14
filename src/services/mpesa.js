// src/utils/mpesa.js
import config from "../config/config.js";

const isSandbox = (config.MPESA_ENV || "sandbox") === "sandbox";
const oauthUrl = isSandbox
  ? "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  : "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";

const stkUrl = isSandbox
  ? "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
  : "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

export async function getMpesaToken() {
  const key = config.MPESA_CONSUMER_KEY;
  const secret = config.MPESA_CONSUMER_SECRET;

  const basic = Buffer.from(`${key}:${secret}`).toString("base64");

  const resp = await fetch(oauthUrl, {
    method: "GET",
    headers: { Authorization: `Basic ${basic}` },
  });
  const json = await resp.json();
  if (!json.access_token) throw new Error("Mpesa OAuth failed: " + JSON.stringify(json));
  return json.access_token;
}

// Generate timestamp (YYYYMMDDHHmmss)
function lipaTimestamp() {
  const d = new Date();
  const YYYY = d.getFullYear().toString();
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${YYYY}${MM}${DD}${hh}${mm}${ss}`;
}

// utility to get timestamp and password per Daraja spec
function lipaPassword(shortcode, passkey, timestamp) {
  const encoded = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  return encoded;
}
/**
 * Initiate STK Push.
 * - phone: payer phone in format 2547xxxxxxxx
 * - amount: number (fiat)
 * - accountReference: string shown in the STK prompt
 * - transactionDesc: description
 * - callbackPath: path appended to MPESA_CALLBACK_BASE to receive confirmation; e.g. '/mpesa/confirmation'
 */
export async function initiateStkPush({ phone, amount, accountReference, transactionDesc, callbackPath = "/mpesa/confirmation" }) {
  const token = await getMpesaToken();
  const timestamp = lipaTimestamp();
  const password = lipaPassword(config.MPESA_SHORTCODE, config.MPESA_PASSKEY, timestamp);

  const body = {
    BusinessShortCode: parseInt(config.MPESA_SHORTCODE, 10),
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(Number(amount)), // integer
    PartyA: phone,
    PartyB: parseInt(config.MPESA_SHORTCODE, 10),
    PhoneNumber: phone,
    CallBackURL: (config.MPESA_CALLBACK_BASE || "") + callbackPath,
    AccountReference: accountReference || "Donation",
    TransactionDesc: transactionDesc || "Donation"
  };

  const resp = await fetch(stkUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const json = await resp.json();
  return json; // includes CheckoutRequestID, ResponseCode etc. Handle errors in caller.
}
