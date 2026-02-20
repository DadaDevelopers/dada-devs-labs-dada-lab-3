/**
 * Campaign status normalization.
 * Backend Campaign.status enum: PENDING | ACTIVE | COMPLETED | CANCELLED.
 * This module provides a single mapping layer for display labels and filters.
 */

export const BACKEND_STATUSES = ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
export type BackendCampaignStatus = (typeof BACKEND_STATUSES)[number];

export type CampaignDisplayStatus =
  | "Rejected"
  | "Disputed"
  | "Cancelled"
  | "Completed"
  | "Pending approval"
  | "Ready"
  | "Service in progress"
  | "Active";

export interface CampaignForStatus {
  status?: string;
  adminStatus?: string;
  confirmationStatus?: string;
  beneficiaryReceipt?: { confirmedAt?: Date | string | null; note?: string } | null;
}

/**
 * Returns a user-friendly label for the campaign's status.
 * Uses backend status (PENDING, ACTIVE, COMPLETED, CANCELLED) plus adminStatus and confirmationStatus.
 */
export function getCampaignStatusLabel(c: CampaignForStatus): CampaignDisplayStatus {
  const status = (c.status ?? "").toUpperCase();
  const adminStatus = (c.adminStatus ?? "pending").toLowerCase();
  const confirmationStatus = (c.confirmationStatus ?? "pending").toLowerCase();

  if (adminStatus === "rejected") return "Rejected";
  if (confirmationStatus === "disputed") return "Disputed";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "COMPLETED") return "Completed";
  if (status === "PENDING") return "Pending approval";
  if (status === "ACTIVE") {
    if (c.beneficiaryReceipt?.confirmedAt) return "Service in progress";
    if (confirmationStatus === "provider_confirmed") return "Ready";
    return "Active";
  }
  return (status ? status.charAt(0) + status.slice(1).toLowerCase() : "Active") as CampaignDisplayStatus;
}

/**
 * Whether the campaign is editable by beneficiary (draft-like or waiting for provider).
 * Backend has no "draft"; PENDING or ACTIVE without provider confirmation is editable.
 */
export function canEditCampaign(c: CampaignForStatus): boolean {
  const status = (c.status ?? "").toUpperCase();
  const confirmationStatus = (c.confirmationStatus ?? "pending").toLowerCase();
  if (status === "PENDING") return true;
  if (status === "ACTIVE" && confirmationStatus !== "provider_confirmed" && confirmationStatus !== "disputed")
    return true;
  return false;
}

/**
 * Filter UI uses "draft" for pending; map to backend "pending".
 */
export function filterStatusToBackend(filterStatus: string): string {
  if (filterStatus === "draft") return "pending";
  return filterStatus.toLowerCase();
}

/**
 * Normalize raw backend status to lowercase for list/filter consistency.
 */
export function normalizeStatusForList(status: string | undefined): string {
  const s = (status ?? "ACTIVE").toUpperCase();
  if (BACKEND_STATUSES.includes(s as BackendCampaignStatus)) return s.toLowerCase();
  return (status ?? "active").toLowerCase();
}
