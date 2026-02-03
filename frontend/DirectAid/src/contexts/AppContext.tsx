// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { User, Campaign, Donation, Notification } from "../types";
import { mockDataService, mockProviderUser, mockBeneficiaryUser, mockDonorUser } from "../services/mockData";

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  selectCampaign: (campaignId: string) => void;
  createCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  updateCampaignStatus: (campaignId: string, status: "approved" | "rejected" | "flagged") => void;
  donations: Donation[];
  createDonation: (donation: Donation) => void;
  updateDonation: (id: string, updates: Partial<Donation>) => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use localStorage to initialize state so you don't lose login on refresh
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem("isAuthenticated") === "true");

  const [campaigns, setCampaigns] = useState<Campaign[]>(mockDataService.getCampaigns());
  const [donations, setDonations] = useState<Donation[]>(mockDataService.getDonations());
  const [notifications, setNotifications] = useState<Notification[]>(mockDataService.getNotifications());
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      let user: User;
      switch (role.toLowerCase()) {
        case "provider": user = mockProviderUser; break;
        case "beneficiary": user = mockBeneficiaryUser; break;
        case "donor": user = mockDonorUser; break;
        default: throw new Error("Invalid role");
      }
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setSelectedCampaign(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isAuthenticated");
  };

  const selectCampaign = (campaignId: string) => {
    const campaign = mockDataService.getCampaignById(campaignId);
    if (campaign) setSelectedCampaign(campaign);
  };

  const createCampaign = (campaign: Campaign) => {
    const newCampaign = { ...campaign, adminStatus: "pending" } as Campaign;
    setCampaigns([newCampaign, ...campaigns]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    const updatedAt = new Date().toISOString();
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt } : c));
    if (selectedCampaign?.id === id) {
      setSelectedCampaign(prev => prev ? { ...prev, ...updates, updatedAt } : null);
    }
  };

  const updateCampaignStatus = (campaignId: string, status: "approved" | "rejected" | "flagged") => {
    const updatedAt = new Date().toISOString();
    setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, adminStatus: status, updatedAt } : c));
    if (selectedCampaign?.id === campaignId) {
      setSelectedCampaign(prev => prev ? { ...prev, adminStatus: status, updatedAt } : null);
    }
  };

  const createDonation = (donation: Donation) => {
    setDonations([donation, ...donations]);
    updateCampaign(donation.campaignId, {
      amountRaised: (campaigns.find(c => c.id === donation.campaignId)?.amountRaised || 0) + donation.amount,
    });
  };

  const updateDonation = (id: string, updates: Partial<Donation>) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated, login, logout, campaigns, selectedCampaign,
      selectCampaign, createCampaign, updateCampaign, updateCampaignStatus,
      donations, createDonation, updateDonation, notifications,
      markNotificationAsRead, unreadCount: notifications.filter(n => !n.read).length,
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