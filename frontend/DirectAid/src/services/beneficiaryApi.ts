/**
 * Beneficiary-only API helpers with fallbacks when backend is unreachable.
 * Keeps api.ts universal; all beneficiary-specific fallbacks live here.
 */
import api from "./api";
import type { BeneficiaryCampaign } from "../hooks/useBeneficiaryApi";

const FALLBACK_METRICS = {
  metrics: {
    totalAidReceived: 0,
    totalDisbursements: 0,
    campaignsSupportingYou: 0,
  },
};

const FALLBACK_CAMPAIGNS_LIST = {
  page: 1,
  limit: 20,
  total: 0,
  campaigns: [],
};

const FALLBACK_DISBURSEMENTS = {
  page: 1,
  limit: 20,
  total: 0,
  disbursements: [],
};

export interface BeneficiaryMetricsResponse {
  metrics: {
    totalAidReceived: number;
    totalDisbursements: number;
    campaignsSupportingYou: number;
  };
}

export async function getMetrics(): Promise<BeneficiaryMetricsResponse> {
  try {
    const res = await api.get("/users/me/metrics");
    const data = (res as any)?.data ?? res;
    return data || FALLBACK_METRICS;
  } catch {
    return FALLBACK_METRICS;
  }
}

export interface BeneficiaryCampaignsListResponse {
  page: number;
  limit: number;
  total: number;
  campaigns: BeneficiaryCampaign[];
}

export async function getMyCampaigns(params?: { page?: number; limit?: number; status?: string; confirmationStatus?: string }): Promise<BeneficiaryCampaignsListResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.page != null) query.set("page", String(params.page));
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.confirmationStatus) query.set("confirmationStatus", params.confirmationStatus);
    const qs = query.toString();
    const res = await api.get(qs ? `/campaigns/me?${qs}` : "/campaigns/me");
    const data = (res as any)?.data ?? res;
    return data || FALLBACK_CAMPAIGNS_LIST;
  } catch {
    return FALLBACK_CAMPAIGNS_LIST;
  }
}

export async function confirmReceipt(
  campaignId: string,
  note?: string
): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await api.patch(`/campaigns/${campaignId}/confirm-beneficiary`, {
      confirmationNote: note ?? undefined,
    });
    return { ok: true, data: res?.data };
  } catch (err: any) {
    const message = err?.response?.data?.message ?? "Failed to confirm receipt";
    return { ok: false, error: message };
  }
}

export interface BeneficiaryDisbursementsResponse {
  page: number;
  limit: number;
  total: number;
  disbursements: any[];
}

export async function getDisbursements(params?: { page?: number; limit?: number; status?: string; campaignId?: string }): Promise<BeneficiaryDisbursementsResponse> {
  try {
    const query = new URLSearchParams();
    if (params?.page != null) query.set("page", String(params.page));
    if (params?.limit != null) query.set("limit", String(params.limit));
    if (params?.status) query.set("status", params.status);
    if (params?.campaignId) query.set("campaignId", params.campaignId);
    const qs = query.toString();
    const res = await api.get(qs ? `/users/me/disbursements?${qs}` : "/users/me/disbursements");
    const data = (res as any)?.data ?? res;
    return data || FALLBACK_DISBURSEMENTS;
  } catch {
    return FALLBACK_DISBURSEMENTS;
  }
}
