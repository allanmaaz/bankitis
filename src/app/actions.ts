'use server';

import {
  getCurrentUser,
  loginWithEmail,
  registerNewUser,
  logoutUser,
  createSessionToken,
  setSessionCookie,
} from '@/lib/auth';
import { resolveUpiRecipient, executeTransfer } from '@/lib/banking';
import {
  getUserBeneficiaries,
  addBeneficiary,
  removeBeneficiary,
  getRegisteredUserDirectory,
} from '@/lib/beneficiaries';
import { getFilteredTransactions, getSpendingAnalytics, TransactionFilterOptions } from '@/lib/transactions';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/notifications';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { TransactionCategory } from '@prisma/client';

export async function loginAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const res = await loginWithEmail(email, password);
  if (!res.success) {
    return { success: false, error: res.error };
  }

  revalidatePath('/');
  return { success: true };
}

export async function quickDemoLoginAction(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true },
  });

  if (!user) {
    return { success: false, error: 'Demo user not found' };
  }

  const token = await createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  await setSessionCookie(token);

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'USER_LOGIN_DEMO',
      details: { email: user.email },
    },
  });

  revalidatePath('/');
  return { success: true };
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const password = formData.get('password') as string;
  const upiPin = formData.get('upiPin') as string;

  if (!fullName || !email || !phoneNumber || !password || !upiPin) {
    return { success: false, error: 'All fields are mandatory' };
  }

  if (upiPin.length !== 6 || !/^\d{6}$/.test(upiPin)) {
    return { success: false, error: 'UPI PIN must be exactly 6 numeric digits' };
  }

  const res = await registerNewUser({
    fullName,
    email,
    phoneNumber,
    password,
    upiPin,
  });

  if (!res.success) {
    return { success: false, error: res.error };
  }

  revalidatePath('/');
  return { success: true };
}

export async function logoutAction() {
  await logoutUser();
  revalidatePath('/');
  return { success: true };
}

export async function resolveRecipientAction(upiId: string) {
  const currentUser = await getCurrentUser();
  return resolveUpiRecipient(upiId, currentUser?.id);
}

export async function transferMoneyAction(data: {
  recipientUpi: string;
  amount: number;
  upiPin: string;
  category?: string;
  note?: string;
  idempotencyKey?: string;
}) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Session expired. Please log in again.' };
  }

  const result = await executeTransfer({
    senderUserId: user.id,
    recipientUpi: data.recipientUpi,
    amount: data.amount,
    upiPin: data.upiPin,
    category: (data.category as TransactionCategory) || TransactionCategory.TRANSFER,
    note: data.note,
    idempotencyKey: data.idempotencyKey,
  });

  if (result.success) {
    revalidatePath('/');
  }

  return result;
}

export async function addBeneficiaryAction(targetUpi: string, nickname?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const res = await addBeneficiary(user.id, targetUpi, nickname);
  if (res.success) {
    revalidatePath('/');
  }
  return res;
}

export async function removeBeneficiaryAction(beneficiaryId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  const res = await removeBeneficiary(user.id, beneficiaryId);
  if (res.success) {
    revalidatePath('/');
  }
  return res;
}

export async function getDirectoryAction(query?: string) {
  const user = await getCurrentUser();
  if (!user) return [];
  return getRegisteredUserDirectory(user.id, query);
}

export async function markNotificationReadAction(notificationId: string) {
  const user = await getCurrentUser();
  if (!user) return;
  await markNotificationAsRead(notificationId, user.id);
  revalidatePath('/');
}

export async function markAllNotificationsReadAction() {
  const user = await getCurrentUser();
  if (!user) return;
  await markAllNotificationsAsRead(user.id);
  revalidatePath('/');
}

export async function fetchTransactionsAction(options: Partial<TransactionFilterOptions>) {
  const user = await getCurrentUser();
  if (!user) return null;

  return getFilteredTransactions({
    accountId: user.account.id,
    ...options,
  });
}

export async function fetchAnalyticsAction() {
  const user = await getCurrentUser();
  if (!user) return null;

  return getSpendingAnalytics(user.account.id);
}

export async function toggleAccountStatusAction(accountId: string, newStatus: 'ACTIVE' | 'FROZEN') {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: Admin privileges required' };
  }

  const { toggleAccountStatus } = await import('@/lib/admin');
  const res = await toggleAccountStatus(user.id, accountId, newStatus);
  if (res.success) {
    revalidatePath('/admin');
    revalidatePath('/');
  }
  return res;
}

export async function adjustAccountBalanceAction(accountId: string, amount: number, reason: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: Admin privileges required' };
  }

  if (isNaN(amount) || amount === 0) {
    return { success: false, error: 'Valid adjustment amount required' };
  }

  const { adjustAccountBalance } = await import('@/lib/admin');
  const res = await adjustAccountBalance(user.id, accountId, amount, reason || 'Administrative Adjustment');
  if (res.success) {
    revalidatePath('/admin');
    revalidatePath('/');
  }
  return res;
}

export async function unlockCustomerPinAction(accountId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized: Admin privileges required' };
  }

  const { unlockCustomerPin } = await import('@/lib/admin');
  const res = await unlockCustomerPin(user.id, accountId);
  if (res.success) {
    revalidatePath('/admin');
    revalidatePath('/');
  }
  return res;
}

export async function fetchCustomerHistoryAction(accountId: string) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return [];
  }

  const { getCustomerTransactions } = await import('@/lib/admin');
  return getCustomerTransactions(accountId);
}

