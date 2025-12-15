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
  // Authentication
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;

  // Campaigns
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  selectCampaign: (campaignId: string) => void;
  createCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;

  // Donations
  donations: Donation[];
  createDonation: (donation: Donation) => void;
  updateDonation: (id: string, updates: Partial<Donation>) => void;

  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  unreadCount: number;

  // UI State
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
  // Start with no user required - everything is public access for now
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data State
  const [campaigns, setCampaigns] = useState<Campaign[]>(
    mockDataService.getCampaigns()
  );
  const [donations, setDonations] = useState<Donation[]>(
    mockDataService.getDonations()
  );
  const [notifications, setNotifications] = useState<Notification[]>(
    mockDataService.getNotifications()
  );
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock authentication based on role
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

      // Store in localStorage for persistence
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

  // ============================================================================
  // CAMPAIGN FUNCTIONS
  // ============================================================================

  const selectCampaign = (campaignId: string) => {
    const campaign = mockDataService.getCampaignById(campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
    }
  };

  const createCampaign = (campaign: Campaign) => {
    setCampaigns([campaign, ...campaigns]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === id
          ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
          : campaign
      )
    );

    // Update selected campaign if it's the one being updated
    if (selectedCampaign?.id === id) {
      setSelectedCampaign((prev) =>
        prev
          ? { ...prev, ...updates, updatedAt: new Date().toISOString() }
          : null
      );
    }
  };

  // ============================================================================
  // DONATION FUNCTIONS
  // ============================================================================

  const createDonation = (donation: Donation) => {
    setDonations([donation, ...donations]);

    // Update campaign amount raised
    updateCampaign(donation.campaignId, {
      amountRaised:
        (campaigns.find((c) => c.id === donation.campaignId)?.amountRaised ||
          0) + donation.amount,
    });
  };

  const updateDonation = (id: string, updates: Partial<Donation>) => {
    setDonations(
      donations.map((donation) =>
        donation.id === id ? { ...donation, ...updates } : donation
      )
    );
  };

  // ============================================================================
  // NOTIFICATION FUNCTIONS
  // ============================================================================

  const markNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

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
// CUSTOM HOOK TO USE CONTEXT
// ============================================================================

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }

  return context;
};
