import { prisma } from "../prisma";

export async function createInvoice(data: any, user: any) {
  // Add validation and role checks as needed
  return prisma.invoice.create({
    data: {
      ...data,
      providerId: user.id,
    },
  });
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({ where: { id } });
}

export async function updateInvoice(id: string, data: any, user: any) {
  // Add validation and role checks as needed
  return prisma.invoice.update({
    where: { id },
    data,
  });
}
