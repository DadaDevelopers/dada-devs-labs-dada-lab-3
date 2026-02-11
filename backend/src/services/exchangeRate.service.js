// src/services/exchangeRate.service.js

export const getExchangeRate = async (from, to) => {
  try {
    const response = await fetch(
      `https://api.exchangerate.host/convert?from=${from}&to=${to}`
    );

    const data = await response.json();

    if (!data || !data.result) {
      throw new Error("Invalid exchange rate response");
    }

    return data.result;
  } catch (error) {
    console.error("Exchange rate error:", error.message);
    throw new Error("Failed to fetch exchange rate");
  }
};

export default {
  getExchangeRate
};
