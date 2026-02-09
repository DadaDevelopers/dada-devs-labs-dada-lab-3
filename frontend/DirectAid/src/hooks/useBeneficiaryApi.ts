import { useState, useEffect, useCallback } from "react";
import * as beneficiaryApi from "../services/beneficiaryApi";

export interface BeneficiaryCampaign {
  id?: string;
  _id?: string;
  publicId?: string;
  title: string;
  description?: string;
  targetAmount: number;
  amountRaised?: number;
  currency?: string;
  status?: string;
  confirmationStatus?: "pending" | "provider_confirmed" | "both_confirmed" | "disputed";
  providerConfirmedAt?: string | null;
  beneficiaryConfirmedAt?: string | null;
  beneficiaryConfirmationNote?: string | null;
  beneficiaryReceipt?: {
    confirmedAt: string | null;
    note: string;
  };
  beneficiaryId?: string;
  providerId?: string | null;
  provider?: { firstName?: string; lastName?: string; organization?: string; name?: string };
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  percentRaised?: number;
  progressPercentage?: number;
  donorCount?: number;
}

export interface BeneficiaryMetrics {
  totalAidReceived: number;
  totalDisbursements: number;
  campaignsSupportingYou: number;
}

export function useBeneficiaryCampaigns() {
  const [campaigns, setCampaigns] = useState<BeneficiaryCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await beneficiaryApi.getMyCampaigns();
      const list = data.campaigns || [];
      setCampaigns(
        list.map((c: BeneficiaryCampaign) => ({
          ...c,
          id: c._id || c.id || c.publicId,
          provider: c.provider ? {
            ...c.provider,
            name: c.provider.organization ||
              (c.provider.firstName || c.provider.lastName
                ? [c.provider.firstName, c.provider.lastName].filter(Boolean).join(" ")
                : "Provider")
          } : undefined,
          progressPercentage:
            c.targetAmount && (c.amountRaised ?? 0) > 0
              ? Math.min(100, ((c.amountRaised ?? 0) / (typeof c.targetAmount === "number" ? c.targetAmount : 0)) * 100)
              : 0,
        }))
      );
    } catch (err: any) {
      setError(err?.message || "Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, loading, error, refetch: fetchCampaigns };
}

export function useBeneficiaryMetrics() {
  const [metrics, setMetrics] = useState<BeneficiaryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    beneficiaryApi
      .getMetrics()
      .then((data) => {
        if (cancelled) return;
        const m = data.metrics;
        setMetrics(
          m
            ? {
              totalAidReceived: typeof m.totalAidReceived === "number" ? m.totalAidReceived : 0,
              totalDisbursements: typeof m.totalDisbursements === "number" ? m.totalDisbursements : 0,
              campaignsSupportingYou:
                typeof m.campaignsSupportingYou === "number" ? m.campaignsSupportingYou : 0,
            }
            : null
        );
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load metrics");
          setMetrics(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { metrics, loading, error };
}

export async function confirmBeneficiaryReceipt(
  campaignId: string,
  confirmationNote?: string
): Promise<{ ok: boolean; error?: string }> {
  const result = await beneficiaryApi.confirmReceipt(campaignId, confirmationNote);
  return { ok: result.ok, error: result.error };
}

export interface BeneficiaryDisbursement {
  id: string;
  campaignId: string;
  amount: number;
  currency: string;
  status: string;
  disbursedAt?: string;
  description?: string | null;
  transactionRef?: string | null;
}

export function useBeneficiaryDisbursements() {
  const [disbursements, setDisbursements] = useState<BeneficiaryDisbursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    beneficiaryApi
      .getDisbursements()
      .then((data) => {
        if (cancelled) return;
        const list = data.disbursements || [];
        setDisbursements(list.map((d: any) => ({ ...d, id: d._id ?? d.id })));
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load disbursements");
          setDisbursements([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { disbursements, loading, error };
}
