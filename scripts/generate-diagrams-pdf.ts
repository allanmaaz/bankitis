import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

async function generateDiagramsPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Page 1: Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BANKITIS ONLINE BANKING SYSTEM', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('UML DIAGRAMS & SYSTEM ARCHITECTURE SPECIFICATION', 14, 24);

  doc.setFontSize(8);
  doc.text('Specification Document • StarUML / Rational Rose / PlantUML Standard', 14, 31);

  // Section 1: Overview
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Diagram Deliverables & Source Files', 14, 46);

  const fileData = [
    ['UML Class Diagram', 'diagrams/ClassDiagram.puml', 'StarUML, Rational Rose, PlantText'],
    ['UML Activity Diagram', 'diagrams/ActivityDiagram.puml', 'StarUML, Rational Rose, PlantText'],
    ['3-Tier System Architecture', 'diagrams/SystemArchitecture.puml', 'Architecture Report & Presentation'],
    ['UML Use Case Diagram', 'diagrams/UseCaseDiagram.puml', 'StarUML / Rational Rose Use-Case View'],
    ['UML Sequence Diagram', 'diagrams/SequenceDiagram.puml', 'StarUML / Rational Rose Sequence View'],
    ['Combined All Diagrams', 'diagrams/ALL_UML_DIAGRAMS.puml', 'Instant 1-Click Paste for StarUML'],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Diagram Name', 'Dedicated File (.puml)', 'Compatible Tools']],
    body: fileData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { fontStyle: 'italic', cellWidth: 65, textColor: [2, 132, 199] },
      2: { cellWidth: 62 },
    },
  });

  // Section 2: UML Class Diagram Entity Details
  const y2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. UML Class Diagram - Domain Entities & Attributes', 14, y2);

  const classData = [
    ['User', '+ id: String\n+ fullName: String\n+ email: String\n+ phoneNumber: String\n- passwordHash: String\n+ role: Role', '+ register(data): User\n+ login(credentials): SessionToken\n+ resetPassword(newPass): Boolean'],
    ['Account', '+ id: String\n+ accountNumber: String\n+ upiId: String\n- upiPinHash: String\n+ failedPinCount: Integer\n+ pinLockedUntil: DateTime\n+ balance: Decimal\n+ status: AccountStatus', '+ checkBalance(amt): Boolean\n+ verifyPin(inputPin): Boolean\n+ lockPin(duration): Void\n+ unlockPin(): Void\n+ updateBalance(delta): Decimal'],
    ['Transaction', '+ id: String\n+ referenceNumber: String\n+ idempotencyKey: String\n+ amount: Decimal\n+ fee: Decimal\n+ status: TransactionStatus\n+ category: TransactionCategory\n+ senderBalanceAfter: Decimal\n+ receiverBalanceAfter: Decimal', '+ executeAtomicTransfer(): Result\n+ generateReferenceNumber(): String'],
    ['Beneficiary', '+ id: String\n+ nickname: String\n+ beneficiaryUpi: String\n+ beneficiaryName: String\n+ ownerId: String', '+ validateRecipient(): Boolean\n+ saveBeneficiary(): Beneficiary\n+ deleteBeneficiary(): Boolean'],
    ['Notification', '+ id: String\n+ title: String\n+ message: String\n+ type: String\n+ isRead: Boolean', '+ markAsRead(): Void\n+ sendEmailAlert(): Void'],
    ['AuditLog', '+ id: String\n+ action: String\n+ ipAddress: String\n+ userAgent: String\n+ details: Json', '+ logEvent(action, details): Void'],
  ];

  autoTable(doc, {
    startY: y2 + 4,
    head: [['Class Name', 'Attributes & Data Types', 'Operations & Methods']],
    body: classData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 30 },
      1: { cellWidth: 75 },
      2: { cellWidth: 77 },
    },
  });

  // Page 2: Activity Diagram & Sequence Diagram
  doc.addPage();

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('3. UML Activity Diagram - Money Transfer Flow (Question 42-45)', 14, 14);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const activitySteps = [
    ['Step 1: Recipient Input', 'Customer inputs target UPI ID (e.g. recipient@bank) or picks from saved beneficiaries.'],
    ['Step 2: Recipient Resolution', 'Asynchronous query checks if account exists and is ACTIVE. Prevents self-transfer.'],
    ['Step 3: Name Verification', 'Compliance verification: Displays verified recipient name in real time.'],
    ['Step 4: Limits Validation', 'Validates: Amount >= INR 1.00, Amount <= INR 1,00,000, Daily utilized <= INR 2,00,000.'],
    ['Step 5: Balance Check', 'Verifies available balance >= transfer amount. Rejects if funds insufficient.'],
    ['Step 6: PIN Security Check', 'Customer enters 6-digit PIN. Salted validation. 3 failed attempts lock account for 15 mins.'],
    ['Step 7: Atomic Lock Check', 'Executes atomic check on accounts in deterministic order to prevent race conditions.'],
    ['Step 8: Atomic Balance Updates', 'Deducts amount from sender and credits receiver in single commit.'],
    ['Step 9: Ledger & Audit Logs', 'Generates TXN-YYYYMMDD-XXXXXX, inserts Transaction record and security AuditLog.'],
    ['Step 10: Alerts & Receipt', 'Emits in-app notifications. Displays success receipt with reference ID.'],
  ];

  autoTable(doc, {
    startY: 30,
    head: [['Activity Workflow Step', 'System Action & Security Rule']],
    body: activitySteps,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 132 },
    },
  });

  // Section 4: 3-Tier Architecture
  const y4 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Enterprise 3-Tier System Architecture', 14, y4);

  const archData = [
    ['Tier 1: Presentation Layer', 'React 19, Tailwind CSS, Vite, Minimal FinTech UI, Admin Console (/admin), PDF & CSV Statement Exporters.'],
    ['Tier 2: Business Logic Layer', 'Pure React Banking Engine, Idempotent Transaction Controller, PIN Validation & Lockout, In-App Notifications.'],
    ['Tier 3: Data & Persistence Layer', 'Cloud PostgreSQL (Supabase) with live table synchronization, client storage fallback, and Immutable Audit Logs.'],
  ];

  autoTable(doc, {
    startY: y4 + 4,
    head: [['Architectural Tier', 'Technology Stack & Responsibilities']],
    body: archData,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 127 },
    },
    didDrawPage: () => {
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        'Bankitis Online Banking System • UML & Software Architecture Specification • Page ' +
          doc.getNumberOfPages(),
        14,
        287
      );
    },
  });

  const outputPath = path.join(process.cwd(), 'UML_AND_ARCHITECTURE_SPEC.pdf');
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Successfully generated UML PDF: ${outputPath}`);
}

generateDiagramsPdf().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});

