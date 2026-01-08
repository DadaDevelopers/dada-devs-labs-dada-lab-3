// adminController.js
import { User } from "../models/User.js";
import Campaign from "../models/Campaign.js";
import Donation from "../models/Donation.js";
import ActivityLog from "../models/ActivityLog.js";
// import { logActivity } from "../utils/activityLogger.js"; // optional if admin controller will write logs too
import mongoose from "mongoose";

export const getAdminStats = async (req, res, next) => {
  try {
    // optional query params
    const months = Math.max(1, Number(req.query.months) || 6);
    const recentActivityLimit = Number(req.query.activityLimit) || 10;

    // derive date for month-based aggregations
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    // build promises and run in parallel for speed
    const [
      totalUsersP,
      activeUsersP,
      deletedUsersP,
      usersByRoleAggP,
      kycByStatusAggP,
      campaignsByStatusAggP,
      pendingKycP,
      totalDonationsP,
      donationsByMonthAggP,
      newUsersLast7DaysP,
      topDonorsP,
      recentActivityP
    ] = await Promise.all([
      // 1. totals
      User.countDocuments({}),

      // 2. active users
      User.countDocuments({ isDeleted: false, isActive: true }),

      // 3. deleted users
      User.countDocuments({ isDeleted: true }),

      // 4. users by role
      User.aggregate([
        { $match: {} }, // adjust match if you want to exclude deleted users
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),

      // 5. KYC by status (for providers)
      User.aggregate([
        { $match: { role: "PROVIDER" } },
        { $group: { _id: "$kycStatus", count: { $sum: 1 } } }
      ]),

      // 6. campaigns by adminStatus
      Campaign.aggregate([
        { $group: { _id: "$adminStatus", count: { $sum: 1 } } }
      ]),

      // 7. pending KYC (quick count)
      User.countDocuments({ role: "PROVIDER", kycStatus: "PENDING", isDeleted: false }),

      // 8. total donations sum (exclude refunded if model has flag)
      Donation.aggregate([
        { $match: { status: "COMPLETED" } }, // adjust as per your schema
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),

      // 9. donations by month for the last `months` months
      Donation.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "COMPLETED" } },
        {
          $group: {
            _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
            total: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),

      // 10. new users last 7 days
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),

      // 11. top donors (top 5 by sum)
      Donation.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: "$donorId", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "donor"
          }
        },
        { $unwind: { path: "$donor", preserveNullAndEmptyArrays: true } },
        { $project: { donorId: "$_id", total: 1, "donor.firstName": 1, "donor.lastName": 1, "donor.email": 1 } }
      ]),

      // 12. recent activity (latest N audit logs)
      ActivityLog.find({})
        .sort({ createdAt: -1 })
        .limit(recentActivityLimit)
        .lean()
    ]);

    // Helper: convert aggregations to map with zero defaults
    const roleDefaults = { ADMIN: 0, DONOR: 0, BENEFICIARY: 0, PROVIDER: 0 };
    const usersByRole = (usersByRoleAggP || []).reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, { ...roleDefaults });

    // KYC map
    const kycByStatus = (kycByStatusAggP || []).reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, { PENDING: 0, APPROVED: 0, REJECTED: 0 });

    // campaigns map
    const campaignsByStatus = (campaignsByStatusAggP || []).reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0, flagged: 0 });

    // total donations
    const totalDonations = (totalDonationsP && totalDonationsP[0] && totalDonationsP[0].total) || 0;

    // format donationsByMonth into ordered array of {year, month, total}
    const donationsByMonth = (donationsByMonthAggP || []).map(d => ({
      year: d._id.year,
      month: d._id.month,
      total: d.total
    }));

    // top donors simplified
    const topDonors = (topDonorsP || []).map(d => ({
      donorId: d.donorId,
      name: d.donor ? `${d.donor.firstName || ""} ${d.donor.lastName || ""}`.trim() || d.donor.email : null,
      email: d.donor?.email || null,
      total: d.total
    }));

    // build response
    res.json({
      totalUsers: totalUsersP,
      activeUsers: activeUsersP,
      deletedUsers: deletedUsersP,
      usersByRole,
      kycByStatus,
      pendingKyc: pendingKycP,
      campaignsByStatus,
      totalDonations,
      donationsByMonth,
      newUsersLast7Days: newUsersLast7DaysP,
      topDonors,
      recentActivity: recentActivityP
    });
  } catch (err) {
    next(err);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const logs = await ActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("actorId", "firstName lastName role")
      .lean();

    res.json({ logs });
  } catch (err) {
    next(err);
  }
};
