import { Request, Response, NextFunction } from "express";
import * as providerService from "../services/provider.service";

export const createProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await providerService.createProvider(req.body);
    res.status(201).json(provider);
  } catch (err) {
    next(err);
  }
};

export const getProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const providers = await providerService.getProviders();
    res.json(providers);
  } catch (err) {
    next(err);
  }
};

export const getProviderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const provider = await providerService.getProviderById(req.params.id);
    if (!provider) return res.status(404).json({ message: "Provider not found" });
    res.json(provider);
  } catch (err) {
    next(err);
  }
};
