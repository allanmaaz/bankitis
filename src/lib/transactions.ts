import { prisma } from './prisma';
import { Prisma, TransactionStatus, TransactionCategory } from '@prisma/client';

export interface TransactionFilterOptions {
  accountId: string;
  type?: 'ALL' | 'DEBIT' | 'CREDIT';
  status?: TransactionStatus;
  category?: TransactionCategory;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  page?: number;
  limit?: number;
}

export async function getFilteredTransactions(options: TransactionFilterOptions) {
  const {
    accountId,
    type = 'ALL',
    status,
    category,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    searchQuery,
    page = 1,
    limit = 20,
  } = options;

  const whereConditions: Prisma.TransactionWhereInput[] = [];

  // Account condition based on type
  if (type === 'DEBIT') {
    whereConditions.push({ senderAccountId: accountId });
  } else if (type === 'CREDIT') {
    whereConditions.push({ receiverAccountId: accountId });
  } else {
    whereConditions.push({
      OR: [{ senderAccountId: accountId }, { receiverAccountId: accountId }],
    });
  }

  if (status) {
    whereConditions.push({ status });
  }

  if (category) {
    whereConditions.push({ category });
  }

  if (startDate || endDate) {
    const dateRange: { gte?: Date; lte?: Date } = {};
    if (startDate) dateRange.gte = startDate;
    if (endDate) {
      const adjustedEnd = new Date(endDate);
      adjustedEnd.setHours(23, 59, 59, 999);
      dateRange.lte = adjustedEnd;
    }
    whereConditions.push({ createdAt: dateRange });
  }

  if (minAmount !== undefined || maxAmount !== undefined) {
    const amountRange: { gte?: Prisma.Decimal; lte?: Prisma.Decimal } = {};
    if (minAmount !== undefined) amountRange.gte = new Prisma.Decimal(minAmount);
    if (maxAmount !== undefined) amountRange.lte = new Prisma.Decimal(maxAmount);
    whereConditions.push({ amount: amountRange });
  }

  if (searchQuery && searchQuery.trim()) {
    const query = searchQuery.trim();
    whereConditions.push({
      OR: [
        { referenceNumber: { contains: query, mode: 'insensitive' } },
        { note: { contains: query, mode: 'insensitive' } },
        { senderAccount: { upiId: { contains: query, mode: 'insensitive' } } },
        { senderAccount: { user: { fullName: { contains: query, mode: 'insensitive' } } } },
        { receiverAccount: { upiId: { contains: query, mode: 'insensitive' } } },
        { receiverAccount: { user: { fullName: { contains: query, mode: 'insensitive' } } } },
      ],
    });
  }

  const finalWhere: Prisma.TransactionWhereInput = {
    AND: whereConditions,
  };

  const [totalCount, transactions] = await Promise.all([
    prisma.transaction.count({ where: finalWhere }),
    prisma.transaction.findMany({
      where: finalWhere,
      include: {
        senderAccount: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
        receiverAccount: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    transactions,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
  };
}

export async function getSpendingAnalytics(accountId: string) {
  // 1. Category breakdown for debits
  const transactions = await prisma.transaction.findMany({
    where: {
      senderAccountId: accountId,
      status: TransactionStatus.COMPLETED,
    },
    select: {
      amount: true,
      category: true,
      createdAt: true,
    },
  });

  const categoryTotals: Record<string, number> = {};
  for (const txn of transactions) {
    const cat = txn.category;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(txn.amount);
  }

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  // 2. Last 6 months cash flow (incoming vs outgoing)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyTxns = await prisma.transaction.findMany({
    where: {
      OR: [{ senderAccountId: accountId }, { receiverAccountId: accountId }],
      status: TransactionStatus.COMPLETED,
      createdAt: { gte: sixMonthsAgo },
    },
    select: {
      amount: true,
      senderAccountId: true,
      receiverAccountId: true,
      createdAt: true,
    },
  });

  const monthMap: Record<string, { month: string; debited: number; credited: number }> = {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMonthsAgo);
    d.setMonth(d.getMonth() + i);
    const key = d.toLocaleString('en-US', { month: 'short' });
    monthMap[key] = { month: key, debited: 0, credited: 0 };
  }

  for (const txn of monthlyTxns) {
    const key = txn.createdAt.toLocaleString('en-US', { month: 'short' });
    if (monthMap[key]) {
      const amt = Number(txn.amount);
      if (txn.senderAccountId === accountId) {
        monthMap[key].debited += amt;
      } else {
        monthMap[key].credited += amt;
      }
    }
  }

  return {
    categoryData,
    monthlyCashFlow: Object.values(monthMap),
  };
}

