// src/services/bitcoin.service.js
import crypto from "crypto";
/**
 * NOTE:
 * This is a provider-agnostic service.
 * Later you can swap internals with:
 * - Blockstream API
 * - mempool.space
 * - BTCPay Server
 */

/**
 * Create a BTC address (on-chain)
 * In production: integrate with your BTC node / wallet service
 */

/*export const createBtcAddress = async () => {
  // In production, this MUST come from:
  // - HD wallet derivation
  // - BTCPay invoice
  // - Custodial wallet API

  return {
    address: "bc1qexamplegeneratedaddressxxxxxxxxxxxx"
  };
};*/

export const createBtcAddress = async ({ donationId }) => {
  // deterministic mock address for now
  return {
    address: `bc1q${crypto.randomBytes(20).toString("hex")}`,
    donationId
  };
};

/**
 * Verify/Check BTC transaction confirmations
 * @param {string} txHash
 * @param {string} expectedAddress
 */
/*export const checkBtcTransaction = async (txHash, expectedAddress) => {
  // Pseudo logic (replace with real node/provider):
  // 1. Fetch tx by hash
  // 2. Check outputs contain expectedAddress
  // 3. Sum output amount
  // 4. Get confirmations

  return {
    txHash,
    confirmations: 2,
    amountSats: "15000",
    toAddress: expectedAddress
  };
};*/

export const checkBtcTransaction = async (txHash) => {
  // Replace with node / block explorer call
  return {
    confirmations: Math.floor(Math.random() * 6),
    status: "CONFIRMED"
  };
};