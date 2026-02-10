import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Campaign beneficiary display name: prefers beneficiaryProfile.displayName, then firstName + lastName, then email. */
export function getBeneficiaryDisplayName(campaign: any, fallback = "Pending Assignment"): string {
  const b = campaign?.beneficiaryId ?? campaign?.beneficiary;
  if (!b) return fallback;
  const displayName = b?.beneficiaryProfile?.displayName ?? (typeof b === "object" && (b as any).displayName);
  if (displayName && String(displayName).trim()) return String(displayName).trim();
  const first = (b as any)?.firstName ?? "";
  const last = (b as any)?.lastName ?? "";
  const name = [first, last].filter(Boolean).join(" ").trim();
  if (name) return name;
  const email = (b as any)?.email;
  if (email) return String(email);
  return (campaign?.beneficiary as any)?.name ?? fallback;
}

/** Get fundraising deadline from campaign (metadata or top-level). */
export function getCampaignDeadline(campaign: any): string | null {
  if (!campaign) return null;
  const raw = (campaign as any).metadata?.fundraisingDeadline ?? (campaign as any).fundraisingDeadline;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : raw;
}

/** Human-readable deadline: "X days remaining", "Ends today", "Ended X days ago", or "No deadline set". */
export function getCampaignDeadlineDisplay(campaign: any): string {
  const raw = getCampaignDeadline(campaign);
  if (!raw) return "No deadline set";
  const end = new Date(raw);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Ended ${Math.abs(diff)} day${Math.abs(diff) !== 1 ? "s" : ""} ago`;
  if (diff === 0) return "Ends today";
  return `${diff} day${diff !== 1 ? "s" : ""} remaining`;
}
