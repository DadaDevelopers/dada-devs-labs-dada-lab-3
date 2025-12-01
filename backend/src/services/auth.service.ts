import { prisma } from "../prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/email";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { add } from "date-fns";

// small helpers
const VERIFICATION_TTL_MINUTES = 60 * 24; // 24 hours
const RESET_TTL_MINUTES = 60; // 1 hour
const REFRESH_TTL_DAYS = 30;

export async function register(data: { firstName: string; lastName?: string; email: string; password: string; role?: string; }) {
  // check existing
  const existing = await prisma.user.findUnique({ where: { email: data.email }});
  if (existing) throw { status: 409, message: "Email already in use" };

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role ? (data.role as any) : "DONOR"
    }
  });

  // create verification token (check if token exists) - create new token
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = add(new Date(), { minutes: VERIFICATION_TTL_MINUTES });

  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt
    }
  });

  // send email (async)
  await sendVerificationEmail(user.email, token);

  return { ok: true, message: "User created. Verification email sent." };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }});
  if (!user) throw { status: 401, message: "Invalid credentials" };
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw { status: 401, message: "Invalid credentials" };

  // optional: enforce verified email? If you want email verification before login, check verification tokens or user property (we didn't add an explicit verified flag; let's infer from absence of active verification tokens)
  // For clarity, you might add a 'isEmailVerified' boolean in User. For now we allow login.

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const refreshToken = signRefreshToken({ userId: user.id, role: user.role });

  // persist refresh token
  const refreshExpiresAt = add(new Date(), { days: REFRESH_TTL_DAYS });
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshExpiresAt
    }
  });

  return { accessToken, refreshToken };
}

export async function verifyEmailToken(token: string) {
  const vt = await prisma.verificationToken.findUnique({ where: { token }});
  if (!vt) throw { status: 400, message: "Invalid token" };
  if (vt.used) throw { status: 400, message: "Token already used" };
  if (vt.expiresAt < new Date()) throw { status: 400, message: "Token expired" };

  // Mark token used. You might also set a User.isEmailVerified bool.
  await prisma.verificationToken.update({ where: { id: vt.id }, data: { used: true }});
  // (Optionally) set user kycStatus or verified flag — we will set KYC to APPROVED? Not necessarily. Instead, we can add isEmailVerified in future.
  return { ok: true, message: "Email verified" };
}

export async function resendVerification(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }});
  if (!user) throw { status: 404, message: "User not found" };

  // check existing not-used and not-expired
  const existing = await prisma.verificationToken.findFirst({
    where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" }
  });
  if (existing) {
    // return but also optionally resend
    await sendVerificationEmail(user.email, existing.token);
    return { ok: true, message: "Existing verification token resent" };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = add(new Date(), { minutes: VERIFICATION_TTL_MINUTES });
  await prisma.verificationToken.create({
    data: { userId: user.id, token, expiresAt }
  });

  await sendVerificationEmail(user.email, token);
  return { ok: true, message: "Verification token created & sent" };
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() }});
  if (!user) {
    // don't reveal user exists
    return { ok: true, message: "If that email exists, a reset link has been sent" };
  }

  // check existing tokens that are unused/not expired; if exists, reuse
  const existing = await prisma.passwordResetToken.findFirst({
    where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" }
  });

  const token = existing ? existing.token : crypto.randomBytes(24).toString("hex");
  if (!existing) {
    const expiresAt = add(new Date(), { minutes: RESET_TTL_MINUTES });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt }
    });
  }

  await sendResetPasswordEmail(user.email, token);
  return { ok: true, message: "If that email exists, a reset link has been sent" };
}

export async function resetPassword(token: string, newPassword: string) {
  const prt = await prisma.passwordResetToken.findUnique({ where: { token }});
  if (!prt) throw { status: 400, message: "Invalid token" };
  if (prt.used) throw { status: 400, message: "Token already used" };
  if (prt.expiresAt < new Date()) throw { status: 400, message: "Token expired" };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: prt.userId }, data: { passwordHash }});
  await prisma.passwordResetToken.update({ where: { id: prt.id }, data: { used: true }});
  return { ok: true, message: "Password reset successfully" };
}

export async function refreshTokens(refreshToken: string) {
  // verify token (signature)
  const payload = verifyRefreshToken(refreshToken);
  // check persisted token
  const dbToken = await prisma.refreshToken.findUnique({ where: { token: refreshToken }});
  if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
    throw { status: 401, message: "Invalid refresh token" };
  }
  const user = await prisma.user.findUnique({ where: { id: dbToken.userId }});
  if (!user) throw { status: 401, message: "Invalid refresh token" };

  const newAccess = signAccessToken({ userId: user.id, role: user.role });
  const newRefresh = signRefreshToken({ userId: user.id, role: user.role });
  // store new refresh token and revoke old one
  await prisma.refreshToken.update({ where: { id: dbToken.id }, data: { revoked: true }});
  const refreshExpiresAt = add(new Date(), { days: REFRESH_TTL_DAYS });
  await prisma.refreshToken.create({
    data: { userId: user.id, token: newRefresh, expiresAt: refreshExpiresAt }
  });

  return { accessToken: newAccess, refreshToken: newRefresh };
}
