// Provider advanced endpoints required by doc
import Provider from "../models/Provider.js";

// Submit provider verification
export const submitProviderVerification = async (req, res, next) => {
  // TODO: Implement actual verification logic
  res.status(201).json({ message: "Provider verification submitted (stub)" });
};

// Setup Lightning configuration
export const setupLightning = async (req, res, next) => {
  // TODO: Implement actual lightning setup logic
  res.status(201).json({ message: "Lightning configuration set up (stub)" });
};

// Get provider transactions
export const getProviderTransactions = async (req, res, next) => {
  // TODO: Implement actual transaction retrieval logic
  res.json({ transactions: [] });
};

// Withdraw (Lightning)
export const providerWithdraw = async (req, res, next) => {
  // TODO: Implement actual withdrawal logic
  res.status(201).json({ message: "Withdrawal request received (stub)" });
};
