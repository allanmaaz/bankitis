import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

async function generateCredentialsPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BANKITIS DIGITAL BANK', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('CONFIDENTIAL SYSTEM ACCESS CREDENTIALS & DEMO SPECIFICATION', 14, 25);

  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Classification: STRICTLY CONFIDENTIAL | Date: ${dateStr}`, 14, 31);

  // 2. Security Disclaimer Box
  doc.setDrawColor(244, 63, 94); // rose-500
  doc.setFillColor(255, 241, 242); // rose-50
  doc.roundedRect(14, 42, 182, 18, 2, 2, 'FD');

  doc.setTextColor(190, 18, 60); // rose-700
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('SECURITY NOTICE:', 18, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    'In compliance with strict banking secrecy guidelines, all credentials have been unlinked and removed from the public',
    18,
    53
  );
  doc.text(
    'web interface. Authorized evaluators and examiners must refer solely to this document for account credentials.',
    18,
    57
  );

  // 3. Section 1: System Administrator Console
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Central Bank Administrator Console', 14, 69);

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 72, 182, 38, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Admin Portal URL: https://bankitis.pages.dev/admin', 18, 80);
  doc.text('Role Permission: Root System Administrator (ADMIN)', 18, 86);
  doc.text('Login Email: admin@bank.com', 18, 92);
  doc.text('Password: Password@123', 18, 98);
  doc.text('Central UPI VPA: admin@bank', 18, 104);

  doc.setFont('helvetica', 'bold');
  doc.text('Security 6-Digit PIN: 999999', 110, 80);
  doc.setFont('helvetica', 'normal');
  doc.text('Capabilities: Freeze/Unfreeze Accounts,', 110, 86);
  doc.text('Balance Adjustments, Audit Trail,', 110, 92);
  doc.text('Full Central Transaction Ledger', 110, 98);

  // 4. Section 2: Customer Test Accounts
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Registered Customer Accounts (P2P Transfers)', 14, 120);

  const customerData = [
    [
      'Customer Account',
      'user@bank.com',
      'Password@123',
      'user@bank',
      '123456',
      'ACC1000849201',
      'INR 75,000.00',
    ],
    [
      'Recipient Account',
      'recipient@bank.com',
      'Password@123',
      'recipient@bank',
      '123456',
      'ACC1000849202',
      'INR 50,000.00',
    ],
  ];

  autoTable(doc, {
    startY: 124,
    head: [
      [
        'Account Holder',
        'Registered Email',
        'Login Password',
        'UPI ID',
        '6-Digit PIN',
        'Account Number',
        'Opening Balance',
      ],
    ],
    body: customerData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 30 },
      2: { cellWidth: 24 },
      3: { cellWidth: 22, fontStyle: 'bold', textColor: [2, 132, 199] },
      4: { cellWidth: 18, fontStyle: 'bold', textColor: [225, 29, 72] },
      5: { cellWidth: 28 },
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
  });

  // 5. Section 3: Rules & Testing Guide
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Transfer Boundaries & Security Enforcement', 14, finalY);

  const rulesData = [
    ['Minimum Transfer Amount', 'INR 1.00 per transaction (enforced in database & UI)'],
    ['Maximum Transfer Amount', 'INR 1,00,000.00 per transaction ceiling'],
    ['Daily Cumulative Limit', 'INR 2,00,000.00 per 24-hour cycle with live utilization gauge'],
    ['Transaction Fee', 'INR 0.00 (Zero Fee)'],
    ['Recipient Verification', 'Automatic pre-transfer identity resolution (Name only)'],
    ['PIN Security Lockout', '3 consecutive invalid PIN entries trigger a 15-minute temporary lockout'],
    ['Double-Spending Guard', 'PostgreSQL ACID row-level locking (SELECT ... FOR UPDATE)'],
    ['Self-Registration', 'Open Account tab provisions instant new account with INR 50,000 test balance'],
  ];

  autoTable(doc, {
    startY: finalY + 4,
    head: [['System Parameter', 'Operational Specification']],
    body: rulesData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 132 },
    },
    didDrawPage: (data) => {
      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Bankitis Online Banking Management System • Confidential Evaluation Material • Page ' +
          doc.getNumberOfPages(),
        14,
        287
      );
    },
  });

  const outputPath = path.join(process.cwd(), 'CREDENTIALS.pdf');
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Successfully generated credentials PDF: ${outputPath}`);
}

generateCredentialsPdf().catch((e) => {
  console.error('Error generating PDF:', e);
  process.exit(1);
});

