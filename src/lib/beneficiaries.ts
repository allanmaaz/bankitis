import { prisma } from './prisma';
import { resolveUpiRecipient } from './banking';

export async function getUserBeneficiaries(userId: string) {
  return prisma.beneficiary.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addBeneficiary(userId: string, targetUpi: string, nickname?: string) {
  const normalizedUpi = targetUpi.toLowerCase().trim();

  // Automatic verification: resolve UPI ID against active registered accounts
  const resolution = await resolveUpiRecipient(normalizedUpi, userId);
  if (!resolution.success || !resolution.recipientName) {
    return {
      success: false,
      error: resolution.error || 'Recipient UPI ID not found among registered users',
    };
  }

  if (resolution.isSelf) {
    return {
      success: false,
      error: 'You cannot add your own UPI ID as a beneficiary',
    };
  }

  // Check if already saved
  const existing = await prisma.beneficiary.findUnique({
    where: {
      ownerId_beneficiaryUpi: {
        ownerId: userId,
        beneficiaryUpi: normalizedUpi,
      },
    },
  });

  if (existing) {
    return {
      success: false,
      error: 'This UPI ID is already saved in your beneficiaries',
    };
  }

  const beneficiary = await prisma.beneficiary.create({
    data: {
      ownerId: userId,
      beneficiaryUpi: normalizedUpi,
      beneficiaryName: resolution.recipientName,
      nickname: nickname?.trim() || null,
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'BENEFICIARY_ADDED',
      details: { upiId: normalizedUpi, name: resolution.recipientName },
    },
  });

  return {
    success: true,
    beneficiary,
  };
}

export async function removeBeneficiary(userId: string, beneficiaryId: string) {
  const beneficiary = await prisma.beneficiary.findFirst({
    where: { id: beneficiaryId, ownerId: userId },
  });

  if (!beneficiary) {
    return { success: false, error: 'Beneficiary not found' };
  }

  await prisma.beneficiary.delete({
    where: { id: beneficiaryId },
  });

  return { success: true };
}

/**
 * Returns registered users in the bank for the contacts/directory based picker.
 */
export async function getRegisteredUserDirectory(currentUserId: string, query?: string) {
  return prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      accounts: { some: { status: 'ACTIVE' } },
      ...(query && query.trim() !== ''
        ? {
            OR: [
              { fullName: { contains: query.trim(), mode: 'insensitive' } },
              { accounts: { some: { upiId: { contains: query.trim(), mode: 'insensitive' } } } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      accounts: {
        select: {
          upiId: true,
          accountNumber: true,
        },
        take: 1,
      },
    },
    take: 20,
  });
}

