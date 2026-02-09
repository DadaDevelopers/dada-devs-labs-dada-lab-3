import api from "./api";
import type { Campaign } from "../types";

export const campaignService = {
    getAllCampaigns: async (): Promise<Campaign[]> => {
        try {
            const response = await api.get("/campaigns");
            // Backend returns campaigns in data property usually
            return response.data.campaigns || response.data || [];
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            throw error;
        }
    },

    getCampaignById: async (id: string): Promise<Campaign> => {
        try {
            const response = await api.get(`/campaigns/${id}`);
            return response.data.campaign || response.data;
        } catch (error) {
            console.error(`Error fetching campaign ${id}:`, error);
            throw error;
        }
    },

    createCampaign: async (campaignData: Partial<Campaign>): Promise<Campaign> => {
        try {
            const response = await api.post("/campaigns", campaignData);
            return response.data;
        } catch (error) {
            console.error("Error creating campaign:", error);
            throw error;
        }
    },

    updateCampaign: async (id: string, updates: Partial<Campaign>): Promise<Campaign> => {
        try {
            const response = await api.put(`/campaigns/${id}`, updates);
            return response.data;
        } catch (error) {
            console.error(`Error updating campaign ${id}:`, error);
            throw error;
        }
    }
};
