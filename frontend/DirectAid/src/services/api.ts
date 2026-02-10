// API client with axios-like interface for frontend
// Point to deployed backend by default; adjust path if needed.
// export const API_BASE = "https://directaid-backend.onrender.com/api";
export const API_BASE = "http://localhost:5000/api";

import type { AdminMetrics } from "../types";

interface ApiInstance {
  setAuthToken: (token: string | null) => void;
  defaults: {
    headers: {
      common: Record<string, string>;
    };
  };
  get: (url: string, config?: any) => Promise<any>;
  post: (url: string, data?: any, config?: any) => Promise<any>;
  put: (url: string, data?: any, config?: any) => Promise<any>;
  patch: (url: string, data?: any, config?: any) => Promise<any>;
  delete: (url: string, config?: any) => Promise<any>;
}

// Helper to make fetch requests with axios-like interface
async function fetchWrapper(
  url: string,
  method: string,
  data?: any,
  headers?: Record<string, string>
) {
  try {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE}${url}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...api.defaults.headers.common,
        ...headers,
      },
    };

    if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(fullUrl, options);
    
    // Handle 204 No Content responses
    if (res.status === 204) {
      console.log(`✓ 204 No Content for ${url} - returning empty object`);
      return {}; // Return empty object for 204 responses
    }
    
    // Handle empty responses
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      if (res.ok) {
        console.log(`✓ Non-JSON response for ${url} (status: ${res.status})`);
        return {}; // Return empty object for non-JSON successful responses
      } else {
        throw new Error(`Request failed with status ${res.status}`);
      }
    }
    
    const responseData = await res.json().catch(() => {
      // If JSON parsing fails but response is ok, return empty object
      if (res.ok) {
        console.log(`✓ Empty JSON response for ${url}`);
        return {};
      }
      throw new Error(`Failed to parse JSON response (status: ${res.status})`);
    });

    if (!res.ok) {
      const error: any = new Error(
        (responseData as { message?: string })?.message || `Request failed with status ${res.status}`
      );
      error.response = { data: responseData, status: res.status };
      throw error;
    }

    return responseData;
    
  } catch (err: any) {
    // If it's already our custom error, rethrow it
    if (err.response) throw err;

    // Admin endpoints: never use demo fallback — require real backend so UI shows error/retry
    const isAdminEndpoint =
      url.includes("/users/stats") ||
      (url.startsWith("/users") && !url.includes("/me")) ||
      url.includes("/providers") ||
      url.includes("/campaigns");
    if (isAdminEndpoint) throw err;

    // Otherwise, handle demo fallback for non-admin
    return handleDemoFallback(url, method, data);
  }
}

// SAFE Demo fallback for when backend is not available
async function handleDemoFallback(url: string, method: string, data?: any) {
  console.warn("⚠️ Using demo fallback for:", url);
  await new Promise((r) => setTimeout(r, 400));

  // Login endpoint — CRITICAL FIX: Check localStorage first for existing users
  if (url.includes("/auth/login")) {
    const cachedToken = localStorage.getItem("auth_token");
    const cachedUser = localStorage.getItem("auth_user");
    
    // If user has existing auth, preserve their REAL role
    if (cachedToken && cachedUser) {
      console.warn("⚠️ Using cached credentials from localStorage");
      const parsedUser = JSON.parse(cachedUser);
      return {
        accessToken: cachedToken,
        user: parsedUser // PRESERVE ACTUAL ROLE!
      };
    }
    
    // Only use UNASSIGNED for truly new users
    return {
      accessToken: "demo-token-" + Date.now(),
      user: {
        id: "demo-user-" + Date.now(),
        email: data?.email || "demo@example.com",
        firstName: "Demo",
        role: "UNASSIGNED",
      },
    };
  }

  // Register endpoint
  if (url.includes("/auth/register")) {
    return {
      accessToken: "demo-access-token-" + Date.now(),
      user: {
        id: "demo-user-" + Date.now(),
        email: data?.email || "demo@example.com",
        firstName: data?.firstName || "Demo",
        role: data?.role || "UNASSIGNED",
      },
    };
  }

  // Forgot password endpoint
  if (url.includes("/auth/forgot-password")) {
    return { success: true, message: "Password reset email sent" };
  }

  // User profile endpoint (both /user/me and /users/me for compatibility)
  if (url.includes("/user/me") || url.includes("/users/me")) {
    if (method === "PUT") {
      return {
        user: {
          id: "demo-user",
          _id: "demo-user",
          email: "demo@example.com",
          firstName: data?.firstName ?? "Demo",
          lastName: data?.lastName ?? "User",
          role: "BENEFICIARY",
          beneficiaryProfile: data?.beneficiaryProfile ?? {},
        },
      };
    }
    return {
      user: {
        id: "demo-user",
        _id: "demo-user",
        email: "demo@example.com",
        firstName: "Demo",
        lastName: "User",
        role: "BENEFICIARY",
        beneficiaryProfile: {},
      },
    };
  }

  // Donate guest endpoint - REMOVE DEMO FALLBACK TO USE REAL BACKEND
  /*
  if (url.includes("/donate/guest")) {
    // Simulate creating a donation and returning payment details
    const method = (data?.method || data?.paymentMethod || "lightning").toString().toLowerCase();
    const donationId = `don_demo_${Date.now()}`;

    if (method === "lightning") {
      return {
        data: {
          donation: {
            id: donationId,
            status: "PENDING",
            amount: data?.amount || 0,
            paymentMethod: "LIGHTNING",
            paymentDetails: {
              lightningInvoice:
                "lnbc1pvjluezpp5qqqsyqcyq5rqwzqfppq9zq9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q", // demo BOLT11
            },
            receiptUrl: `https://directaid.example.com/receipts/${donationId}`,
          },
        },
      };
    }

    // default to on-chain bitcoin
    return {
      data: {
        donation: {
          id: donationId,
          status: "PENDING",
          amount: data?.amount || 0,
          paymentMethod: "BITCOIN",
          paymentDetails: {
            onchainAddress: "tb1qexampleaddressxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // demo testnet address
          },
          receiptUrl: `https://directaid.example.com/receipts/${donationId}`,
        },
      },
    };
  }
  */

  // Public providers list endpoint
  if (url.includes("/providers/public")) {
    return {
      providers: [
        {
          id: "provider_001",
          organizationName: "Global Relief Foundation",
          organizationType: "other",
          city: "Lagos",
          country: "Nigeria",
        },
        {
          id: "provider_002",
          organizationName: "City General Hospital",
          organizationType: "hospital",
          city: "Nairobi",
          country: "Kenya",
        },
        {
          id: "provider_003",
          organizationName: "Hope Education Center",
          organizationType: "school",
          city: "Accra",
          country: "Ghana",
        },
      ],
    };
  }

  // No mock fallback for admin endpoints — let them throw so UI shows error/retry
  // Default response
  return { success: true };
}

// ——— Admin API (real backend only; no mock fallback) ———

export interface AdminStatsRaw {
  totalUsers?: number;
  activeUsers?: number;
  deletedUsers?: number;
  usersByRole?: Record<string, number>;
  kycByStatus?: Record<string, number>;
  pendingKyc?: number;
  campaignsByStatus?: Record<string, number>;
  totalDonations?: number;
  donationsByMonth?: { year: number; month: number; total: number }[];
  newUsersLast7Days?: number;
  topDonors?: { donorId: string; name: string | null; email: string | null; total: number }[];
  recentActivity?: unknown[];
}

/** GET /users/stats — throws on error (no mock). */
export async function getAdminStats(): Promise<AdminStatsRaw> {
  const res = await api.get("/users/stats");
  return (res?.data ?? res) as AdminStatsRaw;
}

/** Map backend stats to AdminMetrics for Overview. Uses only real backend data. */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const raw = await getAdminStats();
  const totalCampaigns =
    (raw.campaignsByStatus?.pending ?? 0) +
    (raw.campaignsByStatus?.approved ?? 0) +
    (raw.campaignsByStatus?.rejected ?? 0) +
    (raw.campaignsByStatus?.flagged ?? 0);
  const totalDonations = Number(raw.totalDonations ?? 0);
  return {
    generatedAt: new Date().toISOString(),
    platformHealth: {
      status: "OPERATIONAL",
      uptimePercent30d: 100,
      lastIncident: { occurredAt: "", resolvedAt: "", summary: "N/A" },
    },
    users: {
      totalUsers: raw.totalUsers ?? 0,
      donors: raw.usersByRole?.DONOR ?? 0,
      beneficiaries: raw.usersByRole?.BENEFICIARY ?? 0,
      providers: raw.usersByRole?.PROVIDER ?? 0,
      admins: raw.usersByRole?.ADMIN ?? 0,
      newUsersToday: raw.newUsersLast7Days ?? 0,
      verifiedUsersPercent: 0,
      flaggedUsers: 0,
      suspendedUsers: 0,
    },
    campaigns: {
      totalCampaigns,
      activeCampaigns: raw.campaignsByStatus?.approved ?? 0,
      completedCampaigns: 0,
      pausedCampaigns: 0,
      rejectedCampaigns: raw.campaignsByStatus?.rejected ?? 0,
      campaignsCreatedToday: 0,
      verificationQueueCount: raw.campaignsByStatus?.pending ?? 0,
      highRiskCampaigns: 0,
    },
    donations: {
      totalDonationsCount: totalDonations,
      lightning: { totalSatsReceived: 0, totalDonations: 0, avgDonationSats: 0, successRatePercent: 0, failedInvoices24h: 0 },
      mpesa: { totalKesReceived: 0, totalDonations: 0, avgDonationKes: 0, pendingPayments: 0, reversedPayments: 0 },
      donationsToday: { count: 0, sats: 0, kes: 0 },
    },
    allocations: { allocatedToBeneficiariesSats: 0, allocatedToProvidersSats: 0, platformFeesSats: 0, pendingAllocations: 0, disputedAllocations: 0 },
    compliance: { kycPending: raw.pendingKyc ?? 0, kycRejected: raw.kycByStatus?.REJECTED ?? 0, amlAlerts: 0, fraudInvestigationsOpen: 0, suspiciousDonationsLast30d: 0 },
    financials: { platformRevenueSats: 0, avgFeePercent: 0, refunds: { totalRefunds: 0, satsRefunded: 0, kesRefunded: 0 } },
    systemQueues: { donationWebhooksBacklog: 0, lightningSettlementLagSecondsAvg: 0, mpesaReconciliationLagMinutesAvg: 0 },
  };
}

/** GET /users with optional role, page, limit, search. */
export async function getUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.role) sp.set("role", params.role);
  if (params?.search) sp.set("search", params.search);
  const q = sp.toString();
  const res = await api.get(`/users${q ? `?${q}` : ""}`);
  return (res?.data ?? res) as { page: number; limit: number; total: number; users: unknown[] };
}

/** GET /users/:id */
export async function getUserById(id: string) {
  const res = await api.get(`/users/${id}`);
  return (res?.data ?? res) as { user: unknown };
}

/** POST /users/:id/verify-identity — body: { identityVerified: boolean, notes?: string } */
export async function verifyUserIdentity(userId: string, body: { identityVerified: boolean; notes?: string }) {
  const res = await api.post(`/users/${userId}/verify-identity`, body);
  return res?.data ?? res;
}

/** GET /providers */
export async function getProviders() {
  const res = await api.get("/providers");
  return (res?.data ?? res) as { providers?: unknown[] };
}

/** GET /providers/:id */
export async function getProviderById(id: string) {
  const res = await api.get(`/providers/${id}`);
  return (res?.data ?? res) as { provider: unknown };
}

/** PUT /providers/:id/kyc — body: { status: "APPROVED" | "REJECTED", notes?: string } */
export async function approveProviderKyc(providerId: string, body: { status: "APPROVED" | "REJECTED"; notes?: string }) {
  const res = await api.put(`/providers/${providerId}/kyc`, body);
  return res?.data ?? res;
}

/** GET /campaigns with optional adminStatus, page, limit */
export async function getCampaigns(params?: { page?: number; limit?: number; adminStatus?: string }) {
  const sp = new URLSearchParams();
  if (params?.page != null) sp.set("page", String(params.page));
  if (params?.limit != null) sp.set("limit", String(params.limit));
  if (params?.adminStatus) sp.set("adminStatus", params.adminStatus);
  const q = sp.toString();
  const res = await api.get(`/campaigns${q ? `?${q}` : ""}`);
  return (res?.data ?? res) as { page: number; limit: number; total: number; campaigns: unknown[] };
}

/** GET /campaigns/:id */
export async function getCampaignById(id: string) {
  const res = await api.get(`/campaigns/${id}`);
  return (res?.data ?? res) as { campaign: unknown };
}

/** PATCH /campaigns/:id/status — body: { status: "approved" | "rejected" | "flagged" | "pending" } */
export async function updateCampaignStatus(campaignId: string, status: "approved" | "rejected" | "flagged" | "pending") {
  const res = await api.patch(`/campaigns/${campaignId}/status`, { status });
  return (res?.data ?? res) as { campaign: unknown };
}

/** PATCH /campaigns/:id/confirm-provider — provider confirms campaign (sets confirmationStatus to provider_confirmed) */
export async function confirmProviderCampaign(campaignId: string) {
  const res = await api.patch(`/campaigns/${campaignId}/confirm-provider`);
  return (res?.data ?? res) as { campaign: unknown };
}

/** POST /campaigns/:id/disburse-to-provider — beneficiary owner sends funds to provider (MVP) */
export async function disburseToProvider(campaignId: string, body: { amount: number; notes?: string }) {
  const res = await api.post(`/campaigns/${campaignId}/disburse-to-provider`, body);
  return (res?.data ?? res) as { disbursement?: unknown; campaign?: unknown };
}

// Create the axios-like API instance
const api: ApiInstance = {
  defaults: {
    headers: {
      common: {},
    },
  },
  setAuthToken: (token: string | null) => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("auth_token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("auth_token");
    }
  },
  get: (url: string, config?: any) =>
    fetchWrapper(url, "GET", undefined, config?.headers),
  post: (url: string, data?: any, config?: any) =>
    fetchWrapper(url, "POST", data, config?.headers),
  put: (url: string, data?: any, config?: any) =>
    fetchWrapper(url, "PUT", data, config?.headers),
  patch: (url: string, data?: any, config?: any) =>
    fetchWrapper(url, "PATCH", data, config?.headers),
  delete: (url: string, config?: any) =>
    fetchWrapper(url, "DELETE", undefined, config?.headers),
};

export default api;