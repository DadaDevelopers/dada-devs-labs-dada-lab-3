import { Request, Response, NextFunction } from "express";
import * as donationService from "../services/donation.service";

export const createDonation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const donation = await donationService.createDonation(req.body, req.user);
    res.status(201).json(donation);
  } catch (err) {
    next(err);
  }
};

export const getDonations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const donations = await donationService.getDonations();
    res.json(donations);
  } catch (err) {
    next(err);
  }
};

export const getDonationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const donation = await donationService.getDonationById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json(donation);
  } catch (err) {
    next(err);
  }
};
