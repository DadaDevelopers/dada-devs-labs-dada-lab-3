import { prisma } from "../prisma";

export async function createDonation(data: any, user: any) {
  // Add validation and role checks as needed
  return prisma.donation.create({
    data: {
      ...data,
      donorId: user.id,
    },
  });
}

export async function getDonations() {
  return prisma.donation.findMany({ include: { campaign: true } });
}

export async function getDonationById(id: string) {
  return prisma.donation.findUnique({ where: { id }, include: { campaign: true } });
}
