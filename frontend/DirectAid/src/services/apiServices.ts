// src/services/apiServices.ts
import api from "./api";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper to get your Auth Token (saved after login)
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const ProviderService = {
  // Matches: POST /api/providers
  createProfile: (data: { businessName: string; phone: string }) => 
    fetch(`${BASE_URL}/providers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }).then(res => res.json()),

  // Matches: GET /api/providers/me
  getProfile: () => 
    fetch(`${BASE_URL}/providers/me`, { headers: getHeaders() }).then(res => res.json()),
};

export const CampaignService = {
  // Matches: GET /api/campaigns
  getAll: (filters?: any) => api.get(`/campaigns`, { params: filters }),

  // Matches: POST /api/campaigns
  create:(campaignData: any) => api.post('/campains', campaignData)
};