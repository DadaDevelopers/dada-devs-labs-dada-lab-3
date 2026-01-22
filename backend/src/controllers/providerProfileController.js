import Provider from "../models/Provider.js";
import ActivityLog from "../models/ActivityLog.js";

// Public provider profile (public fields only)
export const getPublicProviderProfile = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ publicId: req.params.publicId })
      .select("organizationName slug description logoUpload serviceTypes country city kyc.status websiteUrl");
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    res.json({ provider });
  } catch (err) {
    next(err);
  }
};

// Upload docs (attach to provider)
export const uploadProviderDocs = async (req, res, next) => {
  // TODO: Implement file upload and attach logic
  res.status(201).json({ message: "Docs uploaded (stub)" });
};

// Service catalog management
export const addService = async (req, res, next) => {
  // TODO: Implement add service logic
  res.status(201).json({ message: "Service added (stub)" });
};
export const updateService = async (req, res, next) => {
  // TODO: Implement update service logic
  res.status(200).json({ message: "Service updated (stub)" });
};
export const deleteService = async (req, res, next) => {
  // TODO: Implement delete service logic
  res.status(200).json({ message: "Service deleted (stub)" });
};

// Provider stats (computed)
export const getProviderStats = async (req, res, next) => {
  // TODO: Implement stats computation
  res.json({ providerStats: {} });
};

// Admin endpoints (list, get, verify, suspend)
export const adminListProviders = async (req, res, next) => {
  // TODO: Implement admin list logic
  res.json({ providers: [] });
};
export const adminGetProvider = async (req, res, next) => {
  // TODO: Implement admin get logic
  res.json({ provider: {} });
};
export const adminVerifyProvider = async (req, res, next) => {
  // TODO: Implement admin verify logic
  res.json({ message: "Provider verified (stub)" });
};
export const adminSuspendProvider = async (req, res, next) => {
  // TODO: Implement admin suspend logic
  res.json({ message: "Provider suspended (stub)" });
};
