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
import { useEffect } from "react";

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
  selectCampaign: (campaignId: string) => Promise<void>;
  createCampaign: (campaign: Campaign) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;

  // ADD THIS: Admin can approve/reject/flag
  updateCampaignStatus: (campaignId: string, status: "approved" | "rejected" | "flagged") => void;

  // Donations
  donations: Donation[];
  createDonation: (donation: Partial<Donation>) => Promise<Donation | undefined>;
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>(
    [] // Start empty, fetch on load
  );
  const [notifications, setNotifications] = useState<Notification[]>(
    mockDataService.getNotifications()
  );
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

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

      // TODO: Replace with real auth service call eventually, keeping mock for login simulation for now
      // but we will fetch DATA for the logged in user really.

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

  const selectCampaign = async (campaignId: string) => {
    // Try to find in current list first
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
    } else {
      // If not found (e.g. direct link), fetch it
      try {
        const fetchedCampaign = await campaignService.getCampaignById(campaignId);
        setSelectedCampaign(fetchedCampaign);
      } catch (err) {
        console.error("Failed to fetch selected campaign", err);
      }
    }
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

    // Update selected campaign if it's the one being updated
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

  // ============================================================================
  // DONATION FUNCTIONS
  // ============================================================================

  const createDonation = async (donation: Partial<Donation>) => {
    try {
      // Use real service
      const newDonation = await donationService.createDonation(donation);
      setDonations([newDonation, ...donations]);

      // Update campaign amount raised (optimistically or refetch)
      // Real backend handles this, but we update UI state locally for now
      if (donation.campaignId) {
        updateCampaign(donation.campaignId, {
          amountRaised:
            (campaigns.find((c) => c.id === donation.campaignId)?.amountRaised ||
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
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
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

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true);
      try {
        const data = await campaignService.getAllCampaigns();
        // Normalize campaigns: status to lowercase, provider name formatting
        const normalizedCampaigns = data.map((c: any) => ({
          ...c,
          id: c.id || c._id || c.publicId || "",
          status: c.status?.toLowerCase() || "active",
          adminStatus: c.adminStatus?.toLowerCase() || "pending",
          beneficiary: {
            ...c.beneficiary,
            name: c.beneficiaryId ? `${c.beneficiaryId.firstName} ${c.beneficiaryId.lastName || ""}`.trim() : "Beneficiary"
          },
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

  // Fetch donations when user logs in (or anonymously if public)
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        if (isAuthenticated) {
          const res = await donationService.getMyDonations();
          const rawDonations = res.donations || [];
          // Normalize donations: status to lowercase, ensure campaign object exists for UI
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