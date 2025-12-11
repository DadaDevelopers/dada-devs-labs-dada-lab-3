// src/contexts/AppContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type {
  User,
  Campaign,
  Donation,
  Invoice,
  Provider,
  Beneficiary,
  Notification,
} from "../types";
import {
  mockDataService,
  mockProviderUser,
  mockBeneficiaryUser,
  mockDonorUser,
} from "../services/mockData";

// ============================================================================
// CONTEXT TYPE DEFINITION
// ============================================================================

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

  // ADD THIS: Admin can approve/reject/flag
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

// ============================================================================
// CREATE CONTEXT
// ============================================================================

const AppContext = createContext<AppContextType | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [campaigns, setCampaigns] = useState<Campaign[]>(
    mockDataService.getCampaigns()
  );
  const [donations, setDonations] = useState<Donation[]>(
    mockDataService.getDonations()
  );
  const [notifications, setNotifications] = useState<Notification[]>(
    mockDataService.getNotifications()
  );
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // AUTHENTICATION FUNCTIONS
  // ========================================================================

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      let user: User;
      switch (role.toLowerCase()) {
        case "provider":
          user = mockProviderUser;
          break;
        case "beneficiary":
          user = mockBeneficiaryUser;
          break;
        case "donor":
          user = mockDonorUser;
          break;
        default:
          throw new Error("Invalid role");
      }

      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem("currentUser", JSON.stringify(user));
      localStorage.setItem("isAuthenticated", "true");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
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

  // ========================================================================
  // CAMPAIGN FUNCTIONS
  // ========================================================================

  const selectCampaign = (campaignId: string) => {
    const campaign = mockDataService.getCampaignById(campaignId);
    if (campaign) setSelectedCampaign(campaign);
  };

  const createCampaign = (campaign: Campaign) => {
    // New campaigns start as "pending" for admin approval
    const newCampaign = { ...campaign, adminStatus: "pending" } as Campaign;
    setCampaigns([newCampaign, ...campaigns]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === id
          ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
          : campaign
      )
    );

    if (selectedCampaign?.id === id) {
      setSelectedCampaign((prev) =>
        prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null
      );
    }
  };

  // NEW FUNCTION: Admin approve/reject/flag
  const updateCampaignStatus = (campaignId: string, status: "approved" | "rejected" | "flagged") => {
    setCampaigns(prev =>
      prev.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, adminStatus: status, updatedAt: new Date().toISOString() }
          : campaign
      )
    );

    // Also update if it's currently selected
    if (selectedCampaign?.id === campaignId) {
      setSelectedCampaign(prev =>
        prev ? { ...prev, adminStatus: status, updatedAt: new Date().toISOString() } : null
      );
    }
  };

  // ========================================================================
  // DONATION & NOTIFICATION FUNCTIONS (unchanged)
  // ========================================================================

  const createDonation = (donation: Donation) => {
    setDonations([donation, ...donations]);
    updateCampaign(donation.campaignId, {
      amountRaised:
        (campaigns.find((c) => c.id === donation.campaignId)?.amountRaised || 0) +
        donation.amount,
    });
  };

  const updateDonation = (id: string, updates: Partial<Donation>) => {
    setDonations(donations.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ========================================================================
  // CONTEXT VALUE
  // ========================================================================

  const value: AppContextType = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    campaigns,
    selectedCampaign,
    selectCampaign,
    createCampaign,
    updateCampaign,
    updateCampaignStatus,   // ← THIS IS NOW AVAILABLE EVERYWHERE
    donations,
    createDonation,
    updateDonation,
    notifications,
    markNotificationAsRead,
    unreadCount,
    isLoading,
    error,
    setError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};