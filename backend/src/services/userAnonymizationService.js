//Anonymize user but keep financial records. GDPR-safe deletion
import { User } from "../models/User.js";

export const anonymizeExpiredUsers = async () => {
  const now = new Date();

  const users = await User.find({
    isDeleted: true,
    scheduledDeletionAt: { $lte: now }
  });

  for (const user of users) {
    await User.findByIdAndUpdate(user._id, {
      email: `deleted_${user._id}@directaid.local`,
      firstName: "Deleted",
      lastName: "User",
      phoneNumber: null,
      passwordHash: null,
      role: "DONOR",
      isDeleted: true,
      deletedAt: user.deletedAt
    });
  }

  return users.length;
};
