// src/utils/matchingEngine.ts
import type { Campaign, Provider, ProviderType } from "../types";

// 3–8. Small configuration interface — lets the caller customize behavior
interface MatchingOptions {
  maxResults?: number;           // how many providers to return at most (default 5)
  requireExactLocation?: boolean; // if true → only providers with EXACTLY same location string
}

// 10–17. Main exported function — this is what you'll call from the wizard or elsewhere
export function matchProvidersToCampaign(
  campaign: Campaign,
  providers: Provider[],           // full list of providers (usually all verified ones)
  options: MatchingOptions = {}    // optional settings, defaults to empty object
): { id: string }[] {              // returns simple array of matching provider IDs

  // 19–22. Destructure options with safe defaults
  const {
    maxResults = 5,
    requireExactLocation = false,
  } = options;

  // ────────────────────────────────────────────────────────────────
  // 25–42. The core filtering logic — only keep providers that pass ALL checks
  const eligible = providers.filter((provider) => {

    // Must be verified — hard requirement
    if (provider.kycStatus !== "verified") return false;

    // Must support this category (using your existing mapping logic)
    if (!matchesCategory(provider.organizationType, campaign.category)) return false;

    // Location must match (exact or partial depending on option)
    if (!matchesLocation(
      provider.location,
      campaign.location,
      requireExactLocation
    )) return false;

    // If we reached here → this provider is eligible
    return true;
  });

  // ────────────────────────────────────────────────────────────────
  // 45–51. Sort the eligible providers — better location match comes first
  eligible.sort((a, b) => {
    const scoreA = locationScore(a.location, campaign.location);
    const scoreB = locationScore(b.location, campaign.location);
    return scoreB - scoreA; // higher score first (descending order)
  });

  // 54. Take only the top N results and convert to simple {id} objects
  return eligible
    .slice(0, maxResults)                    // limit number
    .map((p) => ({ id: p.id }));             // we only need IDs for now
}

// ────────────────────────────────────────────────────────────────
// Helper: Check if provider type supports this campaign category
// 59–72
function matchesCategory(
  providerType: Provider["organizationType"],
  campaignCategory: Campaign["category"]
): boolean {
  const mapping: Record<ProviderType, Campaign["category"][]> = {
    hospital: ["medical", "emergency"],
    school: ["education"],
    pharmacy: ["medical"],
    ngo: ["emergency", "other", "business"],
    other: ["other", "business", "emergency"],
  };

  // Safe access: if type not in map → false, else check if category is allowed
  return mapping[providerType]?.includes(campaignCategory) ?? false;
}

// ────────────────────────────────────────────────────────────────
// Helper: Decide if locations match (exact or fuzzy)
// 76–88
function matchesLocation(
  providerLoc: string | undefined,
  campaignLoc: string,
  requireExact: boolean
): boolean {
  if (!providerLoc) return false; // no location → no match

  const p = providerLoc.toLowerCase().trim();
  const c = campaignLoc.toLowerCase().trim();

  if (requireExact) {
    return p === c; // strict equality
  }

  // Fuzzy/partial match — good enough for MVP
  return p.includes(c) || c.includes(p);
}

// ────────────────────────────────────────────────────────────────
// Helper: Give numeric score for sorting (higher = better location match)
// 92–102
function locationScore(
  providerLoc: string | undefined,
  campaignLoc: string
): number {
  if (!providerLoc) return 0;

  const p = providerLoc.toLowerCase().trim();
  const c = campaignLoc.toLowerCase().trim();

  if (p === c) return 2;          // perfect match → highest priority
  if (p.includes(c) || c.includes(p)) return 1; // partial match → still good
  return 0;                       // no useful match
}