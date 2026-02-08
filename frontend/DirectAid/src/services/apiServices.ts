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
  getCampaigns: () => api.get("/campaigns"), // Assuming you'll add a list endpoint
  getById: (id: string) => api.get(`/campaigns/${id}`),
  create: (data: any) => api.post("/campaigns", data),
  // THE KEY ENDPOINT FOR YOUR CONFIRMATION PAGE:
  acceptCampaign: (id: string) => api.post(`/campaigns/${id}/provider-accept`),
};
