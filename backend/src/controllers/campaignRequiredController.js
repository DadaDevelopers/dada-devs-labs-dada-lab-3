// Campaign advanced endpoints required by doc
import Campaign from "../models/Campaign.js";

// Link provider to campaign
export const linkProviderToCampaign = async (req, res, next) => {
  // TODO: Implement actual linking logic
  res.status(201).json({ message: "Provider linked to campaign (stub)" });
};

// Provider accept campaign
export const providerAcceptCampaign = async (req, res, next) => {
  // TODO: Implement actual provider accept logic
  res.status(200).json({ message: "Provider accepted campaign (stub)" });
};
