// Create: src/services/providerApi.ts
import api from "./api";

export const providerApi = {
  // Get provider profile
  getProfile: () => api.get("/providers/me"),
  
  // Get provider campaigns
  getCampaigns: () => {
    // We'll need to create a proper endpoint for this
    // For now, filter from all campaigns
    return api.get("/campaigns").then(response => {
      // Filter logic here
      return response;
    });
  },
  
  // Accept campaign
  acceptCampaign: (campaignId: string, notes?: string) => 
    api.post(`/campaigns/${campaignId}/provider-accept`, { notes }),
  
  // Withdraw funds
  withdraw: (amount: number, payoutMethodId: string) =>
    api.post("/providers/me/withdraw", { amount, payoutMethodId }),
  
  // Get payout methods
  getPayoutMethods: () => api.get("/providers/me").then(res => res.provider.payoutMethods),
  
  // Submit campaign for review
  submitForReview: (campaignId: string) =>
    api.post(`/campaigns/${campaignId}/submit`),
};