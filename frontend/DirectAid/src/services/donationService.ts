import api from "./api";
import type { Donation } from "../types";

export const donationService = {
  // Create a new donation
  createDonation: async (data: Partial<Donation>) => {
    const response = await api.post("/donations", data);
    return response.data;
  },

  // Get current user's donations
  getMyDonations: async (): Promise<{ donations: Donation[] }> => {
    const response = await api.get("/donations/me");
    const data = response.data;

    // Normalize data: backend uses amountFiat, frontend expects amount (in cents/base*100)
    if (data && Array.isArray(data.donations)) {
      data.donations = data.donations.map((d: any) => ({
        ...d,
        id: d._id || d.id, // Ensure id is accessible
        amount: Math.round((d.amountFiat || 0) * 100), // convert to cents for frontend consistency
      }));
    }

    return data;
  },

  // Get a single donation detail
  getDonationById: async (id: string): Promise<Donation> => {
    const response = await api.get(`/donations/${id}`);
    const d = response.data;
    if (d) {
      return {
        ...d,
        id: d._id || d.id,
        amount: Math.round((d.amountFiat || 0) * 100)
      };
    }
    return d;
  },

  // Get donor metrics
  getDonorMetrics: async () => {
    const response = await api.get("/donations/me/donor-metrics");
    return response.data;
  },

  // Get receipt Data
  getReceipt: async (id: string) => {
    const response = await api.get(`/donations/receipts/${id}`);
    return response.data;
  },

  // Get Receipts list (via query filters if needed, or filtering client side from getMyDonations)
  // For now we can reuse getMyDonations and filter or add a specific endpoint if backend supports it
};
