import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Bank Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TEAM-9 DIGITAL BANK', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL ACCOUNT STATEMENT & TRANSACTION RECORD', 14, 23);

  const genDate = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${genDate}`, 196, 23, { align: 'right' });

  // 2. Account Details Card
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT SUMMARY', 14, 40);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 43, 182, 30, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Customer Name: ${user.fullName}`, 18, 51);
  doc.text(`Account Number: ${user.account.accountNumber}`, 18, 58);
  doc.text(`UPI Virtual Address: ${user.account.upiId}`, 18, 65);

  doc.text(`Registered Email: ${user.email}`, 110, 51);
  doc.text(`Mobile Number: ${user.phoneNumber}`, 110, 58);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Current Available Balance: INR ${Number(user.account.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 110, 65);

  // 3. Transactions Table
  const tableData = transactions.map((t) => {
    const isDebit = t.senderAccountId === accountId;
    const type = isDebit ? 'DEBIT' : 'CREDIT';
    const party = isDebit
      ? `To: ${t.receiverAccount.user.fullName} (${t.receiverAccount.upiId})`
      : `From: ${t.senderAccount.user.fullName} (${t.senderAccount.upiId})`;
    const debit = isDebit ? `INR ${Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-';
    const credit = !isDebit ? `INR ${Number(t.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-';
    const bal = isDebit ? t.senderBalanceAfter : t.receiverBalanceAfter;
    const runningBal = `INR ${Number(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    const dateStr = new Date(t.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });

    return [
      dateStr,
      t.referenceNumber,
      party,
      type,
      debit,
      credit,
      runningBal,
    ];
  });

  autoTable(doc, {
    startY: 80,
    head: [['Date', 'Ref No.', 'Description / Counterparty', 'Type', 'Debit (-)', 'Credit (+)', 'Balance']],
    body: tableData.length > 0 ? tableData : [['-', '-', 'No transactions found for this period', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 32 },
      2: { cellWidth: 48 },
      3: { cellWidth: 16 },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 22, halign: 'right' },
      6: { cellWidth: 22, halign: 'right' },
    },
    didDrawPage: (data) => {
      // Footer
      const str = `Page ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'This is a computer-generated bank statement from Team-9 Banking Management System and requires no physical signature.',
        14,
        287
      );
      doc.text(str, 196, 287, { align: 'right' });
    },
  });

  const pdfOutput = doc.output('arraybuffer');
  const filename = `Statement_${user.account.accountNumber}.pdf`;

  return new NextResponse(pdfOutput, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

