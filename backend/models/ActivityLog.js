import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    actorRole: {
      type: String,
      enum: ["ADMIN", "DONOR", "BENEFICIARY", "PROVIDER", "SYSTEM"],
      default: "SYSTEM"
    },

    actionType: {
      type: String,
      required: true,
      index: true
      /*
        Examples:
        - ADMIN_APPROVED_CAMPAIGN
        - ADMIN_REJECTED_CAMPAIGN
        - ADMIN_FLAGGED_CAMPAIGN
        - ADMIN_CHANGED_USER_ROLE
        - ADMIN_SCHEDULE_DELETE_USER
        - USER_REQUEST_DELETE
        - USER_RESTORE_ACCOUNT
      */
    },

    entityType: {
      type: String,
      required: true
      /*
        Examples:
        - User
        - Campaign
        - Donation
        - Withdrawal
      */
    },

    entityId: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    metadata: {
      type: Object,
      default: {}
      /*
        Flexible extra data:
        {
          oldStatus: "pending",
          newStatus: "approved",
          reason: "Incomplete documentation"
        }
      */
    },

    ipAddress: {
      type: String
    },

    userAgent: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Helpful indexes for admin dashboards
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ actorId: 1, createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
