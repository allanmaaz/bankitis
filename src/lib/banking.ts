import { prisma } from './prisma';
import { verifyUpiPin } from './auth';
import { Prisma, TransactionCategory, TransactionStatus } from '@prisma/client';

export interface TransferInput {
  senderUserId: string;
  recipientUpi: string;
  amount: number;
  upiPin: string;
  category?: TransactionCategory;
  note?: string;
  idempotencyKey?: string;
}

export interface TransferResult {
  success: boolean;
  error?: string;
  referenceNumber?: string;
  amount?: number;
  recipientName?: string;
  recipientUpi?: string;
  senderBalanceAfter?: number;
  createdAt?: Date;
  note?: string | null;
}

/**
 * Resolves a recipient by UPI ID for instant verification before sending funds.
 */
export async function resolveUpiRecipient(upiId: string, currentUserId?: string) {
  const normalizedUpi = upiId.toLowerCase().trim();

  const account = await prisma.account.findUnique({
    where: { upiId: normalizedUpi },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
  });

  if (!account || account.status !== 'ACTIVE') {
    return {
      success: false,
      error: 'UPI ID does not match any active customer account',
    };
  }

  const isSelf = currentUserId === account.user.id;

  return {
    success: true,
    upiId: account.upiId,
    recipientName: account.user.fullName,
    isSelf,
    accountNumberMasked: `•••• ${account.accountNumber.slice(-4)}`,
  };
}

/**
 * Calculates the total transfers sent by the account today (since 00:00:00 local time).
 */
export async function getDailyTransferUtilized(senderAccountId: string): Promise<number> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: {
      senderAccountId,
      status: TransactionStatus.COMPLETED,
      createdAt: { gte: startOfDay },
    },
    select: { amount: true },
  });

  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  return total;
}

/**
 * Executes an atomic funds transfer using PostgreSQL row-level locks (SELECT FOR UPDATE).
 */
export async function executeTransfer(input: TransferInput): Promise<TransferResult> {
  const { senderUserId, recipientUpi, amount, upiPin, category, note, idempotencyKey } = input;

  // 1. Basic Boundary Validations
  if (!amount || isNaN(amount) || amount < 1) {
    return { success: false, error: 'Transfer amount must be at least ₹1.00' };
  }
  if (amount > 100000) {
    return { success: false, error: 'Transfer amount exceeds maximum per-transaction limit of ₹1,00,000.00' };
  }

  // 2. Fetch Sender Account
  const senderAccount = await prisma.account.findFirst({
    where: { userId: senderUserId, status: 'ACTIVE' },
    include: { user: true },
  });

  if (!senderAccount) {
    return { success: false, error: 'Sender account not found or is currently inactive' };
  }

  // 3. Check Account Lockout status
  if (senderAccount.pinLockedUntil && senderAccount.pinLockedUntil > new Date()) {
    const minutesLeft = Math.ceil((senderAccount.pinLockedUntil.getTime() - Date.now()) / 60000);
    return {
      success: false,
      error: `Security Alert: Account temporarily locked due to multiple incorrect PIN attempts. Try again in ${minutesLeft} minute(s).`,
    };
  }

  // 4. Verify 6-Digit UPI PIN
  const isPinValid = await verifyUpiPin(upiPin, senderAccount.upiPinHash);
  if (!isPinValid) {
    const newFailedCount = senderAccount.failedPinCount + 1;
    let lockUntil: Date | null = null;
    let errorMsg = `Incorrect UPI PIN. ${3 - newFailedCount} attempt(s) remaining.`;

    if (newFailedCount >= 3) {
      lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      errorMsg = 'Incorrect UPI PIN entered 3 times. Transfers are temporarily locked for 15 minutes.';
    }

    await prisma.account.update({
      where: { id: senderAccount.id },
      data: {
        failedPinCount: newFailedCount >= 3 ? 0 : newFailedCount,
        pinLockedUntil: lockUntil,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: senderUserId,
        action: 'FAILED_PIN_ATTEMPT',
        details: { failedCount: newFailedCount, locked: !!lockUntil },
      },
    });

    return { success: false, error: errorMsg };
  }

  // Reset failed PIN counter on success
  if (senderAccount.failedPinCount > 0) {
    await prisma.account.update({
      where: { id: senderAccount.id },
      data: { failedPinCount: 0, pinLockedUntil: null },
    });
  }

  // 5. Check Idempotency Key
  if (idempotencyKey) {
    const existing = await prisma.transaction.findUnique({
      where: { idempotencyKey },
      include: {
        receiverAccount: { include: { user: true } },
      },
    });
    if (existing) {
      return {
        success: true,
        referenceNumber: existing.referenceNumber,
        amount: Number(existing.amount),
        recipientName: existing.receiverAccount.user.fullName,
        recipientUpi: existing.receiverAccount.upiId,
        senderBalanceAfter: Number(existing.senderBalanceAfter),
        createdAt: existing.createdAt,
        note: existing.note,
      };
    }
  }

  // 6. Resolve Recipient
  const normalizedRecipientUpi = recipientUpi.toLowerCase().trim();
  const receiverAccount = await prisma.account.findUnique({
    where: { upiId: normalizedRecipientUpi },
    include: { user: true },
  });

  if (!receiverAccount || receiverAccount.status !== 'ACTIVE') {
    return { success: false, error: 'Recipient UPI ID not found or account is inactive' };
  }

  if (receiverAccount.id === senderAccount.id) {
    return { success: false, error: 'Self-transfer to the same account is not permitted' };
  }

  // 7. Daily Limit Check (₹2,00,000 maximum daily transfer)
  const todayUtilized = await getDailyTransferUtilized(senderAccount.id);
  const DAILY_LIMIT = 200000;
  if (todayUtilized + amount > DAILY_LIMIT) {
    const remainingLimit = Math.max(0, DAILY_LIMIT - todayUtilized);
    return {
      success: false,
      error: `Daily transfer limit of ₹2,00,000.00 exceeded. Your remaining limit for today is ₹${remainingLimit.toLocaleString('en-IN')}`,
    };
  }

  // 8. Generate Unique Transaction Reference
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const referenceNumber = `TXN-${dateStr}-${randomSuffix}`;

  // 9. Execute Atomic ACID Transaction with PostgreSQL Row Locking
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Acquire row locks deterministically by ordering account IDs to prevent deadlocks
        const accountIds = [senderAccount.id, receiverAccount.id].sort();
        await tx.$queryRaw`
          SELECT id FROM "Account" 
          WHERE id IN (${accountIds[0]}, ${accountIds[1]}) 
          FOR UPDATE
        `;

        // Re-read sender's balance under the locked transaction
        const lockedSender = await tx.account.findUniqueOrThrow({
          where: { id: senderAccount.id },
        });

        const currentBalance = Number(lockedSender.balance);
        if (currentBalance < amount) {
          throw new Error('INSUFFICIENT_FUNDS');
        }

        const lockedReceiver = await tx.account.findUniqueOrThrow({
          where: { id: receiverAccount.id },
        });

        const newSenderBalance = currentBalance - amount;
        const newReceiverBalance = Number(lockedReceiver.balance) + amount;

        // Perform balance updates
        await tx.account.update({
          where: { id: senderAccount.id },
          data: { balance: newSenderBalance },
        });

        await tx.account.update({
          where: { id: receiverAccount.id },
          data: { balance: newReceiverBalance },
        });

        // Insert Transaction record
        const txn = await tx.transaction.create({
          data: {
            referenceNumber,
            idempotencyKey,
            amount: new Prisma.Decimal(amount),
            fee: new Prisma.Decimal(0),
            status: TransactionStatus.COMPLETED,
            category: category || TransactionCategory.TRANSFER,
            note: note?.trim() || null,
            senderAccountId: senderAccount.id,
            receiverAccountId: receiverAccount.id,
            senderBalanceAfter: new Prisma.Decimal(newSenderBalance),
            receiverBalanceAfter: new Prisma.Decimal(newReceiverBalance),
          },
        });

        // Create Notifications
        await tx.notification.create({
          data: {
            userId: senderUserId,
            title: 'Money Sent Successfully',
            message: `₹${amount.toLocaleString('en-IN')} debited for payment to ${receiverAccount.user.fullName} (${receiverAccount.upiId}). Ref: ${referenceNumber}`,
            type: 'DEBIT',
          },
        });

        await tx.notification.create({
          data: {
            userId: receiverAccount.userId,
            title: 'Money Received',
            message: `₹${amount.toLocaleString('en-IN')} credited to your account from ${senderAccount.user.fullName} (${senderAccount.upiId}). Ref: ${referenceNumber}`,
            type: 'CREDIT',
          },
        });

        // Create Audit Logs
        await tx.auditLog.create({
          data: {
            userId: senderUserId,
            action: 'TRANSFER_EXECUTED',
            details: {
              referenceNumber,
              amount,
              recipientUpi: receiverAccount.upiId,
              status: 'COMPLETED',
            },
          },
        });

        return {
          referenceNumber,
          amount,
          recipientName: receiverAccount.user.fullName,
          recipientUpi: receiverAccount.upiId,
          senderBalanceAfter: newSenderBalance,
          createdAt: txn.createdAt,
          note: txn.note,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
        maxWait: 5000,
        timeout: 10000,
      }
    );

    return {
      success: true,
      ...result,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'INSUFFICIENT_FUNDS') {
      return {
        success: false,
        error: `Insufficient account balance. Available: ₹${Number(senderAccount.balance).toLocaleString('en-IN')}`,
      };
    }
    console.error('Transfer execution error:', err);
    return {
      success: false,
      error: 'Transaction failed due to a system processing error. Please try again.',
    };
  }
}

