import { prisma } from "../prisma";

export async function createProvider(data: any) {
  // Add validation and role assignment as needed
  const { password, ...rest } = data;
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      ...rest,
      passwordHash,
      role: "PROVIDER",
    },
  });
}

export async function getProviders() {
  return prisma.user.findMany({ where: { role: "PROVIDER" } });
}

export async function getProviderById(id: string) {
  return prisma.user.findUnique({ where: { id, role: "PROVIDER" } });
}
