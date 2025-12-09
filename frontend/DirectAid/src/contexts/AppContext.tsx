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
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

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
    setCampaigns([campaign, ...campaigns]);
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(
      campaigns.map((campaign) => {
        if (campaign.id !== id) return campaign;

        let updatedCampaign = { ...campaign, ...updates, updatedAt: new Date().toISOString() };

        // Automatically set confirmation timestamps
        if (updates.confirmationStatus) {
          if (
            updates.confirmationStatus === "provider_confirmed" &&
            !campaign.providerConfirmedAt
          ) {
            updatedCampaign.providerConfirmedAt = new Date().toISOString();
          } else if (updates.confirmationStatus === "both_confirmed") {
            if (!campaign.providerConfirmedAt) {
              updatedCampaign.providerConfirmedAt = new Date().toISOString();
            }
            if (!campaign.beneficiaryConfirmedAt) {
              updatedCampaign.beneficiaryConfirmedAt = new Date().toISOString();
            }
          }
        }

        return updatedCampaign;
      })
    );

    if (selectedCampaign?.id === id) {
      setSelectedCampaign((prev) => {
        if (!prev) return null;
        let updatedSelected = { ...prev, ...updates, updatedAt: new Date().toISOString() };

        if (updates.confirmationStatus) {
          if (
            updates.confirmationStatus === "provider_confirmed" &&
            !prev.providerConfirmedAt
          ) {
            updatedSelected.providerConfirmedAt = new Date().toISOString();
          } else if (updates.confirmationStatus === "both_confirmed") {
            if (!prev.providerConfirmedAt) {
              updatedSelected.providerConfirmedAt = new Date().toISOString();
            }
            if (!prev.beneficiaryConfirmedAt) {
              updatedSelected.beneficiaryConfirmedAt = new Date().toISOString();
            }
          }
        }

        return updatedSelected;
      });
    }
  };

  // ========================================================================
  // DONATION FUNCTIONS
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
    setDonations(
      donations.map((donation) => (donation.id === id ? { ...donation, ...updates } : donation))
    );
  };

  // ========================================================================
  // NOTIFICATION FUNCTIONS
  // ========================================================================

  const markNotificationAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
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
