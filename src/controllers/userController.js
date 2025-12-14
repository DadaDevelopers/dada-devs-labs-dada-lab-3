import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import { verifyAccessToken } from "../utils/token.js";

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
    const { firstName, lastName, phoneNumber } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();
    res.json({ user: user.toObject({ getters: true, virtuals: false }) });
  } catch (err) { next(err); }
};

// Admin: list all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.json({ users });
  } catch (err) { next(err); }
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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!["DONOR", "BENEFICIARY", "PROVIDER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    user.role = role;
    await user.save();
    res.json({ user });
  } catch (err) { next(err); }
};

// Admin: delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) { next(err); }
};
