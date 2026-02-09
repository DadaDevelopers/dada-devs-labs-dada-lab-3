// src/contexts/AppContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from "react";
import type {
  User,
  Campaign,
  Donation,
  Notification,
} from "../types";
import {
  mockProviderUser,
  mockBeneficiaryUser,
  mockDonorUser,
  mockDataService,
} from "../services/mockData";
import { donationService } from "../services/donationService";
import { campaignService } from "../services/campaignService";

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
  updateCampaignStatus: (campaignId: string, status: "approved" | "rejected" | "flagged") => void;
  donations: Donation[];
  createDonation: (donation: Partial<Donation>) => Promise<Donation | undefined>;
  updateDonation: (id: string, updates: Partial<Donation>) => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>(
    mockDataService.getNotifications()
  );
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

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

  // ============================================================================
  // CAMPAIGN FUNCTIONS
  // ============================================================================

  const selectCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId || (c as any)._id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
    } else {
      try {
        const fetchedCampaign = await campaignService.getCampaignById(campaignId);
        setSelectedCampaign(fetchedCampaign);
      } catch (err) {
        console.error("Failed to fetch selected campaign", err);
      }
    }
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

  // ============================================================================
  // DONATION FUNCTIONS
  // ============================================================================

  const createDonation = async (donation: Partial<Donation>) => {
    try {
      const newDonation = await donationService.createDonation(donation);
      setDonations([newDonation, ...donations]);
      if (donation.campaignId) {
        const cid = donation.campaignId;
        updateCampaign(cid, {
          amountRaised:
            (campaigns.find((c) => (c as any).id === cid || (c as any)._id === cid)?.amountRaised ||
              0) + (donation.amount || 0),
        });
      }
      return newDonation;
    } catch (err) {
      console.error("Failed to create donation", err);
      setError("Failed to process donation");
      return undefined;
    }
  };

  const updateDonation = (id: string, updates: Partial<Donation>) => {
    setDonations(prev =>
      prev.map(d => ((d as any).id === id || (d as any)._id === id) ? { ...d, ...updates } : d)
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
    updateCampaignStatus,
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

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const data = await campaignService.getAllCampaigns();
        const normalizedCampaigns = (data || []).map((c: any) => ({
          ...c,
          status: c.status?.toLowerCase() || "active",
          adminStatus: c.adminStatus?.toLowerCase() || "pending",
          provider: {
            ...c.provider,
            name: c.providerId?.organization ||
              (c.providerId?.firstName ? `${c.providerId.firstName} ${c.providerId.lastName || ""}`.trim() : "DirectAid Provider")
          }
        }));
        setCampaigns(normalizedCampaigns);
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
        setError("Failed to load campaigns");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        if (isAuthenticated) {
          const res = await donationService.getMyDonations();
          const rawDonations = res.donations || [];
          const normalizedDonations = rawDonations.map((d: any) => ({
            ...d,
            status: d.status?.toLowerCase() || "pending",
            campaign: d.campaignId ? {
              ...d.campaignId,
              title: d.campaignId.title || "Campaign",
              status: d.campaignId.status?.toLowerCase() || "active"
            } : d.campaign
          }));
          setDonations(normalizedDonations);
        }
      } catch (err) {
        console.error("Failed to fetch donations", err);
      }
    };
    fetchDonations();
  }, [isAuthenticated]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};