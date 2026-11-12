import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accountId = user.account.id;
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [{ senderAccountId: accountId }, { receiverAccountId: accountId }],
    },
    include: {
      senderAccount: { include: { user: true } },
      receiverAccount: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const csvRows = transactions.map((t) => {
    const isDebit = t.senderAccountId === accountId;
    const type = isDebit ? 'DEBIT' : 'CREDIT';
    const counterparty = isDebit
      ? `${t.receiverAccount.user.fullName} (${t.receiverAccount.upiId})`
      : `${t.senderAccount.user.fullName} (${t.senderAccount.upiId})`;
    const balanceAfter = isDebit ? t.senderBalanceAfter : t.receiverBalanceAfter;

    return {
      'Transaction Date': new Date(t.createdAt).toISOString(),
      'Reference Number': t.referenceNumber,
      'Type': type,
      'Category': t.category,
      'Counterparty': counterparty,
      'Amount (INR)': Number(t.amount).toFixed(2),
      'Status': t.status,
      'Running Balance (INR)': Number(balanceAfter).toFixed(2),
      'Note': t.note || '',
    };
  });

  const csvString = Papa.unparse(csvRows);

  const filename = `Statement_${user.account.accountNumber}_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvString, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

