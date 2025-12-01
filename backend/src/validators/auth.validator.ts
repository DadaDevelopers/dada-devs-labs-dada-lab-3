import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["DONOR","BENEFICIARY","PROVIDER","ADMIN"]).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const emailSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8)
});
