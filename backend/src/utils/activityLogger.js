import ActivityLog from "../models/ActivityLog.js";

/**
 * Log an activity event
 */
export const logActivity = async ({
  actorId,
  actorRole = "SYSTEM",
  actionType,
  entityType,
  entityId,
  description = "",
  metadata = {},
  req = null
}) => {
  try {
    await ActivityLog.create({
      actorId,
      actorRole,
      actionType,
      entityType,
      entityId: String(entityId),
      description,
      metadata,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"]
    });
  } catch (err) {
    // Never break main flow due to logging failure
    console.error("Activity log error:", err.message);
  }
};
