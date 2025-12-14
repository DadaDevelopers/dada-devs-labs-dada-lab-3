import bcrypt from "bcryptjs";
import config from "../config/config.js";
//import User from "../models/User.js";
import { User, RefreshToken, VerificationToken, PasswordResetToken } from "../models/User.js";
import { generateRandomToken, hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/token.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/mailer.js";

function setRefreshCookie(res, token) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: config.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  };
  res.cookie(config.COOKIE_NAME, token, cookieOptions);
}

export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !email || !password) return res.status(400).json({ message: "Missing fields" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
    const user = await User.create({ firstName, lastName, email, passwordHash, role: role || "DONOR" });

    // verification token (raw -> send, hashed -> store)
    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour
    await VerificationToken.create({ userId: user._id, tokenHash, expiresAt });

    await sendVerificationEmail(user.email, rawToken);

    // create tokens
    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });

    const refreshHash = hashToken(refreshToken);
    const refreshExpiry = new Date(Date.now() + config.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ userId: user._id, tokenHash: refreshHash, expiresAt: refreshExpiry });

    setRefreshCookie(res, refreshToken);
    res.status(201).json({ accessToken, user: { id: user._id, email: user.email, firstName: user.firstName, role: user.role } });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isEmailVerified) return res.status(403).json({ message: "Please verify email" });

    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = signRefreshToken({ userId: user._id.toString(), role: user.role });

    const refreshHash = hashToken(refreshToken);
    const refreshExpiry = new Date(Date.now() + config.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ userId: user._id, tokenHash: refreshHash, expiresAt: refreshExpiry });

    setRefreshCookie(res, refreshToken);
    res.json({ accessToken, user: { id: user._id, email: user.email, firstName: user.firstName, role: user.role } });
  } catch (err) { next(err); }
}

export async function refreshHandler(req, res, next) {
  try {
    const token = req.cookies?.[config.COOKIE_NAME] || req.body.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    let payload;
    try { payload = verifyRefreshToken(token); } catch (e) { return res.status(401).json({ message: "Invalid refresh token" }); }

    const tokenHash = hashToken(token);
    const stored = await RefreshToken.findOne({ tokenHash: tokenHash });
    if (!stored) {
      // reuse detection
      await RefreshToken.updateMany({ userId: payload.userId }, { $set: { revoked: true, revokedAt: new Date() } });
      return res.status(401).json({ message: "Refresh token reuse detected. All sessions revoked." });
    }
    if (stored.revoked || stored.expiresAt < new Date()) return res.status(401).json({ message: "Refresh token expired/invalid" });

    // rotate: revoke old, create new
    stored.revoked = true;
    stored.revokedAt = new Date();
    await stored.save();

    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: "Invalid refresh token" });

    const newRefresh = signRefreshToken({ userId: user._id.toString(), role: user.role });
    const newHash = hashToken(newRefresh);
    const newExpiry = new Date(Date.now() + config.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ userId: user._id, tokenHash: newHash, expiresAt: newExpiry, ip: req.ip, userAgent: req.get("User-Agent") });

    const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
    setRefreshCookie(res, newRefresh);
    res.json({ accessToken, user: { id: user._id, email: user.email, firstName: user.firstName, role: user.role } });
  } catch (err) { next(err); }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.[config.COOKIE_NAME] || req.body.refreshToken;
    if (token) {
      const tokenHash = hashToken(token);
      await RefreshToken.updateMany({ tokenHash }, { $set: { revoked: true, revokedAt: new Date() } });
    }
    res.clearCookie(config.COOKIE_NAME, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    res.json({ message: "Logged out" });
  } catch (err) { next(err); }
}

export async function me(req, res, next) {
  // expects Authorization: Bearer <accessToken>
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) return res.status(401).json({ message: "Unauthorized" });
    const token = auth.split(" ")[1];
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    res.json({ user });
  } catch (err) { next(err); }
}

export async function verifyEmail(req, res, next) {
  try {
    const raw = req.params.token;
    if (!raw) return res.status(400).json({ message: "No token" });
    const tokenHash = hashToken(raw);
    const vt = await VerificationToken.findOne({ tokenHash, used: false, expiresAt: { $gt: new Date() } });
    if (!vt) return res.status(400).json({ message: "Invalid or expired token" });
    vt.used = true;
    await vt.save();
    await User.findByIdAndUpdate(vt.userId, { isEmailVerified: true });
    // redirect or respond
    return res.redirect(`${config.FRONTEND_URL}/login?verified=true`);
  } catch (err) { next(err); }
}

export async function resendVerification(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    const raw = generateRandomToken(32);
    await VerificationToken.create({ userId: user._id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 60*60*1000) });
    await sendVerificationEmail(user.email, raw);
    res.json({ message: "Verification email sent" });
  } catch (err) { next(err); }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: "If that email exists, a reset was sent" });
    const raw = generateRandomToken(32);
    await PasswordResetToken.create({ userId: user._id, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 60*60*1000) });
    await sendResetPasswordEmail(user.email, raw);
    res.json({ message: "If that email exists, a reset was sent" });
  } catch (err) { next(err); }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Invalid payload" });
    const tokenHash = hashToken(token);
    const prt = await PasswordResetToken.findOne({ tokenHash, used: false, expiresAt: { $gt: new Date() } });
    if (!prt) return res.status(400).json({ message: "Invalid or expired token" });
    prt.used = true; await prt.save();
    const passwordHash = await bcrypt.hash(newPassword, config.BCRYPT_ROUNDS);
    await User.findByIdAndUpdate(prt.userId, { passwordHash });
    // revoke all refresh tokens
    await RefreshToken.updateMany({ userId: prt.userId }, { $set: { revoked: true, revokedAt: new Date() } });
    res.json({ message: "Password reset successful" });
  } catch (err) { next(err); }
}
