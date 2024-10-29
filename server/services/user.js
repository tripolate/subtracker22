import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function createUser(data) {
  const hashedPassword = data.password ? 
    await bcrypt.hash(data.password, 10) : 
    null;

  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      settings: {
        create: {
          emailNotifications: true,
          renewalReminders: 7,
          trialReminders: 3,
        },
      },
    },
    include: {
      settings: true,
    },
  });
}

export async function updateUserSettings(userId, settings) {
  return prisma.userSettings.update({
    where: { userId },
    data: settings,
  });
}

export async function getUserWithSettings(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
      subscriptions: {
        orderBy: { nextBillingDate: 'asc' },
      },
    },
  });
}

export async function deleteUser(userId) {
  // Delete all related data
  await prisma.$transaction([
    prisma.userSettings.delete({ where: { userId } }),
    prisma.subscription.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}