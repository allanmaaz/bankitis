import { prisma } from './prisma';
import { AccountStatus, Role } from '@prisma/client';

export async function getAdminMetrics() {
  const [
    totalCustomers,
    totalAccounts,
    activeAccounts,
    frozenAccounts,
    customerAccounts,
    transactions,
    recentAudits,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.CUSTOMER } }),
    prisma.account.count(),
    prisma.account.count({ where: { status: AccountStatus.ACTIVE } }),
    prisma.account.count({ where: { status: AccountStatus.FROZEN } }),
    prisma.account.findMany({
      where: { user: { role: Role.CUSTOMER } },
      select: { balance: true },
    }),
    prisma.transaction.findMany({
      select: { amount: true, status: true },
    }),
    prisma.auditLog.count(),
  ]);

  const totalDeposits = customerAccounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalVolume = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return {
    totalCustomers,
    totalAccounts,
    activeAccounts,
    frozenAccounts,
    totalDeposits,
    totalTransactionsCount: transactions.length,
    totalVolume,
    recentAuditsCount: recentAudits,
  };
}

export async function getAllCustomerAccounts() {
  return prisma.account.findMany({
    where: {
      user: { role: Role.CUSTOMER },
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phoneNumber: true,
          role: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function toggleAccountStatus(adminUserId: string, accountId: string, newStatus: AccountStatus) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { user: true },
  });

  if (!account) {
    return { success: false, error: 'Account not found' };
  }

  const updated = await prisma.account.update({
    where: { id: accountId },
    data: { status: newStatus },
  });

  // Notify customer
  await prisma.notification.create({
    data: {
      userId: account.userId,
      title: newStatus === AccountStatus.FROZEN ? 'Account Frozen by Bank' : 'Account Re-Activated',
      message:
        newStatus === AccountStatus.FROZEN
          ? `Your account (${account.accountNumber}) has been temporarily frozen by Bank Administration. Outgoing transfers are paused.`
          : `Your account (${account.accountNumber}) has been un-frozen and full banking services are restored.`,
      type: 'SECURITY',
    },
  });

  // Record Audit
  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'ADMIN_ACCOUNT_STATUS_CHANGE',
      details: {
        targetAccountId: account.id,
        targetUpi: account.upiId,
        targetUser: account.user.fullName,
        previousStatus: account.status,
        newStatus,
      },
    },
  });

  return { success: true, account: updated };
}

export async function unlockCustomerPin(adminUserId: string, accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { user: true },
  });

  if (!account) {
    return { success: false, error: 'Account not found' };
  }

  const updated = await prisma.account.update({
    where: { id: accountId },
    data: {
      failedPinCount: 0,
      pinLockedUntil: null,
    },
  });

  await prisma.notification.create({
    data: {
      userId: account.userId,
      title: 'Security PIN Lock Lifted',
      message:
        'Your 6-digit transaction PIN security lockout has been cleared by Bank Administration. You may now perform transfers.',
      type: 'SECURITY',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'ADMIN_PIN_UNLOCK',
      details: {
        targetAccountId: account.id,
        targetUpi: account.upiId,
        targetUser: account.user.fullName,
      },
    },
  });

  return { success: true, account: updated };
}

export async function getCustomerTransactions(accountId: string) {
  return prisma.transaction.findMany({
    where: {
      OR: [{ senderAccountId: accountId }, { receiverAccountId: accountId }],
    },
    include: {
      senderAccount: { include: { user: true } },
      receiverAccount: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function adjustAccountBalance(
  adminUserId: string,
  accountId: string,
  adjustmentAmount: number,
  reason: string
) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { user: true },
  });

  if (!account) {
    return { success: false, error: 'Account not found' };
  }

  const currentBal = Number(account.balance);
  const newBal = currentBal + adjustmentAmount;

  if (newBal < 0) {
    return { success: false, error: 'Adjustment would result in negative balance' };
  }

  const updated = await prisma.account.update({
    where: { id: accountId },
    data: { balance: newBal },
  });

  await prisma.notification.create({
    data: {
      userId: account.userId,
      title: 'Administrative Balance Adjustment',
      message: `Bank Admin adjusted your balance by ${
        adjustmentAmount >= 0 ? '+' : ''
      }₹${adjustmentAmount.toLocaleString('en-IN')}. Reason: ${reason}. New balance: ₹${newBal.toLocaleString('en-IN')}.`,
      type: adjustmentAmount >= 0 ? 'CREDIT' : 'DEBIT',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: 'ADMIN_BALANCE_ADJUSTMENT',
      details: {
        targetAccountId: account.id,
        targetUpi: account.upiId,
        targetUser: account.user.fullName,
        adjustmentAmount,
        previousBalance: currentBal,
        newBalance: newBal,
        reason,
      },
    },
  });

  return { success: true, newBalance: newBal };
}

export async function getSystemWideTransactions() {
  return prisma.transaction.findMany({
    include: {
      senderAccount: {
        include: { user: { select: { fullName: true, email: true } } },
      },
      receiverAccount: {
        include: { user: { select: { fullName: true, email: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function getSystemWideAuditLogs() {
  return prisma.auditLog.findMany({
    include: {
      user: {
        select: { fullName: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

