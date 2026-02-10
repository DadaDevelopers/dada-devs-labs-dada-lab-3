import api from "./api";
import type { Campaign } from "../types";

export const campaignService = {
    getAllCampaigns: async (): Promise<Campaign[]> => {
        try {
            const response = await api.get("/campaigns");
            // API returns body directly: { campaigns, page, total }
            return response?.campaigns || response?.data?.campaigns || [];
        } catch (error) {
            console.error("Error fetching campaigns:", error);
            throw error;
        }
    },

    getCampaignById: async (id: string): Promise<Campaign> => {
        try {
            const response = await api.get(`/campaigns/${id}`);
            // `api` returns parsed JSON directly, but some call sites/dev changes expect axios-like `{ data }`.
            return (
                (response as any)?.campaign ??
                (response as any)?.data?.campaign ??
                (response as any)?.data ??
                response
            );
        } catch (error) {
            console.error(`Error fetching campaign ${id}:`, error);
            throw error;
        }
    },

    createCampaign: async (campaignData: Partial<Campaign>): Promise<Campaign> => {
        try {
            const response = await api.post("/campaigns", campaignData);
            return (response as any)?.data ?? response;
        } catch (error) {
            console.error("Error creating campaign:", error);
            throw error;
        }
    },

    updateCampaign: async (id: string, updates: Partial<Campaign>): Promise<Campaign> => {
        try {
            const response = await api.put(`/campaigns/${id}`, updates);
            return (response as any)?.data ?? response;
        } catch (error) {
            console.error(`Error updating campaign ${id}:`, error);
            throw error;
        }
    }
};
