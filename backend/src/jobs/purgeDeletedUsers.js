import cron from "node-cron";
import { anonymizeExpiredUsers } from "../services/userAnonymizationService.js";

export const startUserPurgeJob = () => {
  cron.schedule("0 2 * * *", async () => {
    try {
      const count = await anonymizeExpiredUsers();
      console.log(`[PURGE JOB] Anonymized ${count} users`);
    } catch (err) {
      console.error("[PURGE JOB ERROR]", err);
    }
  });
};
