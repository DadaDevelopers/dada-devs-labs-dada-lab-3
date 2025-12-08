import { prisma } from "../prisma";

export async function createCampaign(data: any, user: any) {
  // Add validation and role checks as needed
  return prisma.campaign.create({
    data: {
      ...data,
      providerId: user.id,
    },
  });
}

export async function getCampaigns() {
  return prisma.campaign.findMany({ include: { donations: true, invoices: true } });
}

export async function getCampaignById(id: string) {
  return prisma.campaign.findUnique({ where: { id }, include: { donations: true, invoices: true } });
}

export async function updateCampaign(id: string, data: any, user: any) {
  // Add validation and role checks as needed
  return prisma.campaign.update({
    where: { id },
    data,
  });
}
