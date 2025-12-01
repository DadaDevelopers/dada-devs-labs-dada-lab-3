import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { registerSchema, loginSchema, emailSchema, resetPasswordSchema } from "../validators/auth.validator";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const tokens = await authService.login(data.email, data.password);
    return res.json(tokens);
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token;
    const result = await authService.verifyEmailToken(token);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = emailSchema.parse(req.body);
    const result = await authService.resendVerification(email);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = emailSchema.parse(req.body);
    const result = await authService.forgotPassword(email);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(data.token, data.newPassword);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    return res.json(tokens);
  } catch (err) {
    next(err);
  }
};
