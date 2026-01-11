//Here is not about authentication(no logins, tokens or verification, they are in authController.js)
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import { verifyAccessToken } from "../utils/token.js";
import { RefreshToken } from "../models/User.js";
// import { logActivity } from "../utils/activityLogger.js";
import ActivityLog from "../models/ActivityLog.js"; // optional if you need it here

// Get current logged-in user info
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) { next(err); }
};

// Update current user's profile
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, country, city } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (country) user.country = country;
    if (city) user.city = city;
    //if (avatar) user.avatar = avatar;

    await user.save();
    res.json({ user: user.toObject({ getters: true, virtuals: false }) });
  } catch (err) { next(err); }
};

// Admin: list all users (pagination, search, sorting, soft delete aware)
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      sortBy = "createdAt",
      order = "desc",
      includeDeleted = "false"
    } = req.query;

    const filter = {};

    // Role filter
    if (role) filter.role = role;

    // Soft delete filter
    if (includeDeleted !== "true") {
      filter.isDeleted = false;
    }

    // Search (email / firstName / lastName)
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } }
      ];
    }

    // Sorting
    const sort = {
      [sortBy]: order === "asc" ? 1 : -1
    };

    const users = await User.find(filter)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select("-passwordHash");

    const total = await User.countDocuments(filter);

    res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      users
    });
  } catch (err) {
    next(err);
  }
};



// Admin: get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) { next(err); }
};

// Admin: update user role
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const actorId = req.user.userId;
    const targetId = req.params.id;

    if (!role) return res.status(400).json({ message: "Missing role" });

    // Allowed non-admin roles by default
    const allowedRoles = ["DONOR", "BENEFICIARY", "PROVIDER"];

    // If trying to assign ADMIN, require SUPER_ADMIN
    if (role === "ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Only SUPER_ADMIN can assign ADMIN role" });
    }

    if (!allowedRoles.includes(role) && role !== "ADMIN") {
      return res.status(400).json({ message: "Invalid role" });
    }

    if (actorId === targetId) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Protect admin accounts (only SUPER_ADMIN can change an ADMIN)
    if (user.role === "ADMIN" && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ message: "Cannot change role of an ADMIN" });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await logActivity({
      actorId,
      actorRole: req.user.role,
      actionType: "ADMIN_CHANGED_USER_ROLE",
      entityType: "User",
      entityId: user._id,
      description: `Changed role ${oldRole} -> ${role}`,
      metadata: { oldRole, newRole: role },
      req
    });

    res.json({ user });
  } catch (err) {
    next(err);
  }
};


// Admin: soft-delete user
// Admin: soft-delete user (improved)
export const adminDeleteUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const actorId = req.user.userId;

    if (actorId === targetId) {
      return res.status(400).json({ message: "Admin cannot delete their own account" });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isDeleted) {
      return res.status(400).json({ message: "User already scheduled for deletion" });
    }

    const now = new Date();
    const deletionDate = new Date(now);
    deletionDate.setDate(deletionDate.getDate() + 30);

    user.isDeleted = true;
    user.deletedAt = now;
    user.scheduledDeletionAt = deletionDate;

    await user.save();

    // Revoke any refresh tokens (example model RefreshToken)
    await RefreshToken.updateMany(
      { userId: user._id, revoked: false },
      { $set: { revoked: true, revokedAt: new Date() } }
    );

    // Audit log (example)
    // await AuditLog.create({
    //   actorId,
    //   actionType: "ADMIN_SCHEDULE_DELETE_USER",
    //   entityType: "User",
    //   entityId: user._id.toString(),
    //   description: `Scheduled deletion (30 days) by admin ${actorId}`
    // });
    //logActivity centralizes metadata like ip and user-agent and handles errors safely.
    await logActivity({
      actorId,
      actorRole: req.user.role,
      actionType: "ADMIN_SCHEDULE_DELETE_USER",
      entityType: "User",
      entityId: user._id.toString(),
      description: `Scheduled deletion (30 days) by admin ${actorId}`,
      metadata: { recoverBefore: deletionDate },
      req
    });

    res.json({ message: "User scheduled for deletion by admin", recoverBefore: deletionDate });
  } catch (err) {
    next(err);
  }
};



/* Desired Behavior (Confirmed)
✔ User can request account deletion
✔ Account becomes inactive immediately
✔ User can recover within 30 days
✔ Login blocked and funds remain protected
✔ After 30 days → permanent deletion
✔ Financial records (donations, payments, invoices) remain compliant */

// User: request account deletion (30-day recovery window)
export const requestAccountDeletion = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isDeleted) {
      return res.status(400).json({ message: "Account already scheduled for deletion" });
    }

    const now = new Date();
    const deletionDate = new Date(now);
    deletionDate.setDate(deletionDate.getDate() + 30);

    user.isDeleted = true;
    user.deletedAt = now;
    user.scheduledDeletionAt = deletionDate;

    await user.save();

    res.json({
      message: "Account scheduled for deletion",
      recoverBefore: deletionDate
    });
  } catch (err) {
    next(err);
  }
};


// User: recover/restore account before/within 30 days
export const restoreAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isDeleted) {
      return res.status(400).json({ message: "Account is not deleted" });
    }

    if (new Date() > user.scheduledDeletionAt) {
      return res.status(400).json({
        message: "Recovery window expired. Account permanently deleted."
      });
    }

    user.isDeleted = false;
    user.deletedAt = null;
    user.scheduledDeletionAt = null;

    await user.save();

    res.json({ message: "Account restored successfully" });
  } catch (err) {
    next(err);
  }
};
