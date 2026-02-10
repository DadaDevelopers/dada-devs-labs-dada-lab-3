// src/services/apiServices.ts
import api from "./api";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper to get your Auth Token (saved after login)
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const ProviderService = {
  getProfile: () => api.get("/providers/me"),
  updateProfile: (data: any) => api.put("/providers/me", data),
  getStats: () => api.get("/providers/me/stats"),
  withdraw: (amount: number) => api.post("/providers/me/withdraw", { amount }),
};

export const CampaignService = {
  /** GET /campaigns - returns body directly (campaigns, page, total). Optional params: page, limit, providerId, status, category, etc. */
  getAll: (params?: { page?: number; limit?: number; providerId?: string; status?: string; category?: string }) => {
    if (!params || !Object.keys(params).length) return api.get("/campaigns");
    const entries = Object.entries(params).filter(([, v]) => v != null && v !== "") as [string, string][];
    const q = entries.length ? "?" + new URLSearchParams(entries).toString() : "";
    return api.get("/campaigns" + q);
  },
  getCampaigns: () => api.get("/campaigns"),
  getById: (id: string) => api.get(`/campaigns/${id}`),
  create: (data: any) => api.post("/campaigns", data),
  acceptCampaign: (id: string) => api.post(`/campaigns/${id}/provider-accept`),
};
