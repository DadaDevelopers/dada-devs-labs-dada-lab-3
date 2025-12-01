import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import ms, { StringValue } from "ms";

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not defined in .env");
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// cast to ms.StringValue
const ACCESS_EXP: StringValue = (process.env.ACCESS_TOKEN_EXPIRES_IN || "15m") as StringValue;
const REFRESH_EXP: StringValue = (process.env.REFRESH_TOKEN_EXPIRES_IN || "30d") as StringValue;

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: ACCESS_EXP };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: REFRESH_EXP };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  } catch (err) {
    throw { status: 401, message: "Invalid refresh token" };
  }
}
