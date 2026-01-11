import crypto from "crypto";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function generateRandomToken(len = 48) {
  return crypto.randomBytes(len).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(payload) {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: config.ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.REFRESH_EXPIRES_IN
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
}
