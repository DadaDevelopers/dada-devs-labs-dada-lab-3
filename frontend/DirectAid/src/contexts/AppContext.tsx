// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import type { User, Campaign, Donation, Notification } from "../types";
import { useAuth } from "./AuthContext"; // Import real auth

interface AppContextType {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  selectCampaign: (campaignId: string) => void;
  createCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  updateCampaignStatus: (campaignId: string, status: "approved" | "rejected" | "flagged") => void;
  donations: Donation[];
  createDonation: (donation: Donation) => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Get real user from AuthContext

  // Initialize with EMPTY arrays, not mock data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LOGIC: Select a campaign from our state
  const selectCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c._id === campaignId);
    if (campaign) setSelectedCampaign(campaign);
  };

  const createCampaign = (campaign: Campaign) => {
    setCampaigns(prev => [campaign, ...prev]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
  };

  const updateCampaignStatus = (campaignId: string, status: "approved" | "rejected" | "flagged") => {
    setCampaigns(prev => prev.map(c => c._id === campaignId ? { ...c, adminStatus: status } : c));
  };

  const createDonation = (donation: Donation) => {
    setDonations(prev => [donation, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      campaigns, selectedCampaign, selectCampaign, createCampaign,
      updateCampaign, updateCampaignStatus, donations, createDonation,
      notifications, markNotificationAsRead, unreadCount,
      isLoading, error, setError
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};