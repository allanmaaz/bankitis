import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

async function generateMasterSpecificationPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryDark = [15, 23, 42]; // slate-900
  const secondaryDark = [30, 41, 59]; // slate-800
  const accentBlue = [2, 132, 199]; // sky-600
  const textMuted = [100, 116, 139]; // slate-500

  const drawPageFooter = (pageNum) => {
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Bankitis Online Banking System • Comprehensive Software Architecture & UML Specification',
      14,
      287
    );
    doc.text(`Page ${pageNum} of 4`, 196, 287, { align: 'right' });
  };

  // ============================================================================
  // PAGE 1: HEADER & FUNCTIONAL BUSINESS MODULES
  // ============================================================================
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BANKITIS ONLINE BANKING SYSTEM', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('COMPREHENSIVE SOFTWARE ARCHITECTURE, MODULES & UML SPECIFICATION', 14, 24);

  doc.setFontSize(8);
  doc.text('Academic & Technical Evaluation Master Document • Pure React 19 / Cloudflare / Supabase PostgreSQL', 14, 31);

  // Section 1: Executive Summary
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive System Overview', 14, 46);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    'Bankitis is a high-reliability, enterprise-modeled online banking and peer-to-peer (P2P) payment application. It features real-time',
    14,
    52
  );
  doc.text(
    'recipient name verification, strict daily and per-transaction limits, dedicated 6-digit transaction PIN security with automated lockout,',
    14,
    56.5
  );
  doc.text(
    'dual-format statement generation (PDF/CSV), personal spending analytics, and live synchronization with cloud PostgreSQL (Supabase).',
    14,
    61
  );

  // Section 2: Functional Business Modules (12 Modules)
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Functional Business Modules (User-Facing Subsystems)', 14, 70);

  const businessModules = [
    ['1. Authentication & Onboarding', 'AuthTabs.jsx', 'Customer sign-in, registration, instant account number generation (ACC1000...), custom UPI handle setup (@bank), and 6-digit PIN initialization.'],
    ['2. Account & Balance Hub', 'BalanceCard.jsx', 'Available balance display, eye toggle for masked account numbers, live status tags (Active, Frozen, PIN Locked), and remaining daily limit progress bar.'],
    ['3. UPI Funds Transfer Engine', 'SendMoneyModal.jsx', 'Multi-step transfer flow, pre-transfer name resolution (Question 42), bounds check (₹1 - ₹1,00,000), 6-digit PIN validation, and atomic debit/credit.'],
    ['4. Beneficiary Management', 'BeneficiariesModal.jsx', 'Add/manage trusted peers without PIN entry, automatic recipient verification before saving, customizable nicknames, and 1-click pay.'],
    ['5. Customer Directory Search', 'DirectoryModal.jsx', 'Global registered user search by UPI handle or account number; 1-click selection to immediately prefill the transfer wizard.'],
    ['6. Transaction Passbook', 'TransactionHistory.jsx', 'Unlimited passbook with multi-dimensional filtering (Debits vs Credits, Categories, Status, keyword search) and dynamic counterparty resolution.'],
    ['7. Financial Statement Export', 'bankingEngine.js', 'Dual statement generators: Formal branded PDF statement with bank header and watermark (jsPDF) + RFC 4180 CSV spreadsheet export (PapaParse).'],
    ['8. Personal Spending Analytics', 'SpendingAnalytics.jsx', 'Visual cash flow summary (Money In vs. Money Out) and percentage distribution across categories (Food, Bills, Utilities, Shopping, Entertainment).'],
    ['9. Notification Center', 'Navbar.jsx / App.jsx', 'Real-time in-app notification drawer with unread counter for credit receipts, debit alerts, and security login notifications.'],
    ['10. Admin Executive Console', 'AdminClient.jsx', 'Dedicated admin portal (/admin) for bank reserves overview, 1-click account freeze/unfreeze, PIN lockout clearance, and manual balance adjustments.'],
    ['11. Security Audit Trail', 'AuditLogView.jsx', 'Immutable chronological security log recording logins, transfers, freeze operations, and balance adjustments with reference IDs and timestamps.'],
    ['12. Cloud Database Connector', 'DatabaseSettingsModal.jsx', 'In-app connection manager enabling live synchronization with cloud PostgreSQL (Supabase), connection status testing, and RLS management.'],
  ];

  autoTable(doc, {
    startY: 74,
    head: [['Module Name', 'Primary Component', 'Functional Capabilities & Operational Rules']],
    body: businessModules,
    theme: 'grid',
    headStyles: { fillColor: primaryDark, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2.2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 46 },
      1: { fontStyle: 'italic', cellWidth: 38, textColor: accentBlue },
      2: { cellWidth: 98 },
    },
  });

  drawPageFooter(1);

  // ============================================================================
  // PAGE 2: CORE PERSISTENCE, TECH STACK & 3-TIER ARCHITECTURE
  // ============================================================================
  doc.addPage();

  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Core Architecture, Persistence Modules & Technical Stack', 14, 14);

  // Section 3: Core & Technical Modules
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('A. Core Engine & Technical Modules', 14, 30);

  const techModules = [
    ['Core Banking State Engine', 'src/lib/bankingEngine.js', 'Pure JavaScript deterministic state machine enforcing financial consistency, atomic debit/credit operations, daily limit tracking, and PIN lockout logic.'],
    ['Supabase Cloud Client', 'src/lib/supabaseClient.js', 'Initializes @supabase/supabase-js, managing live asynchronous queries, table updates, and connection testing between frontend and cloud database.'],
    ['PostgreSQL DDL Schema', 'supabase_schema.sql', 'Complete relational schema defining tables (users, accounts, transactions, beneficiaries, notifications, audit_logs) and Row-Level Security (RLS) policies.'],
    ['UI Component Framework', 'React 19 + React DOM', 'Powers reactive single-page components, modals, accessible form states, and instant interactive state updates.'],
    ['Build & Bundling Engine', 'Vite 6', 'Provides next-generation build toolchain, asset optimization, tree shaking, and hot module replacement with sub-second reload times.'],
    ['Styling Design System', 'Tailwind CSS v4', 'High-performance utility-first CSS framework delivering minimal, responsive, mobile-first fintech interface components.'],
    ['Vector PDF Generator', 'jsPDF & AutoTable', 'Enables in-browser vector PDF creation, custom fonts, auto-paginated financial tables, and bank watermarks without backend overhead.'],
    ['CSV Parser & Serializer', 'PapaParse', 'RFC 4180 compliant delimited spreadsheet formatting for instant transactional passbook CSV exports.'],
    ['Iconography Suite', 'Lucide React', 'Modern, lightweight SVG icons embedded throughout navigation, balance cards, status badges, and action dialogs.'],
  ];

  autoTable(doc, {
    startY: 34,
    head: [['Module / Technology', 'File / Package', 'Role & Technical Implementation']],
    body: techModules,
    theme: 'grid',
    headStyles: { fillColor: secondaryDark, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 46 },
      1: { fontStyle: 'italic', cellWidth: 38, textColor: accentBlue },
      2: { cellWidth: 98 },
    },
  });

  // Section 4: 3-Tier Enterprise Architecture
  const yArch = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('B. Enterprise 3-Tier System Architecture', 14, yArch);

  const archTiers = [
    ['Tier 1: Presentation Layer (Browser Client)', 'Cloudflare Pages / React 19 / Tailwind CSS', 'Delivered via global edge CDN. Houses the customer dashboard, send money wizard, beneficiary management, admin console (/admin), and responsive mobile views.'],
    ['Tier 2: Business Logic & Application Layer', 'Banking Engine / Controller / Auth', 'Enforces strict validation rules: pre-transfer name resolution, amount limits (₹1 - ₹1,00,000), daily ceiling (₹2,00,000), 6-digit PIN hashing, and lockout timers.'],
    ['Tier 3: Data & Persistence Layer', 'Cloud PostgreSQL (Supabase) + LocalStorage', 'Primary: Cloud-hosted PostgreSQL with real-time relational tables (users, accounts, transactions, audit_logs). Fallback: Sandboxed browser localStorage (bankitis_data_v4).'],
  ];

  autoTable(doc, {
    startY: yArch + 4,
    head: [['Architectural Tier', 'Technology Stack', 'Responsibilities & Operations']],
    body: archTiers,
    theme: 'striped',
    headStyles: { fillColor: primaryDark, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { fontStyle: 'italic', cellWidth: 42, textColor: accentBlue },
      2: { cellWidth: 90 },
    },
  });

  // Section 5: Diagram Files & Compatible Tools
  const yPuml = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('C. Dedicated UML Diagram Source Files (.puml)', 14, yPuml);

  const pumlFiles = [
    ['UML Class Diagram', 'diagrams/ClassDiagram.puml', 'StarUML, Rational Rose, Visual Paradigm, PlantText'],
    ['UML Activity Diagram', 'diagrams/ActivityDiagram.puml', 'StarUML, PlantText (Workflow Viva Evaluation)'],
    ['3-Tier System Architecture', 'diagrams/SystemArchitecture.puml', 'StarUML Component Diagram, PlantText, Reports'],
    ['UML Use Case Diagram', 'diagrams/UseCaseDiagram.puml', 'StarUML, Rational Rose Use-Case View'],
    ['UML Sequence Diagram', 'diagrams/SequenceDiagram.puml', 'StarUML, Rational Rose Sequence View'],
    ['Combined All Diagrams', 'diagrams/ALL_UML_DIAGRAMS.puml', 'Instant 1-Click Paste for StarUML PlantUML extension'],
  ];

  autoTable(doc, {
    startY: yPuml + 4,
    head: [['Diagram Name', 'Dedicated Source File', 'Supported UML Tools']],
    body: pumlFiles,
    theme: 'grid',
    headStyles: { fillColor: secondaryDark, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { fontStyle: 'italic', cellWidth: 50, textColor: accentBlue },
      2: { cellWidth: 82 },
    },
  });

  drawPageFooter(2);

  // ============================================================================
  // PAGE 3: UML CLASS DIAGRAM & UML USE CASE DIAGRAM
  // ============================================================================
  doc.addPage();

  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('4. UML Class Diagram & Use Case Specifications', 14, 14);

  // Section 6: UML Class Diagram
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('A. UML Class Diagram - Domain Entities, Attributes & Operations', 14, 30);

  const classEntities = [
    ['User', '+ id: String\n+ fullName: String\n+ email: String\n+ phoneNumber: String\n- passwordHash: String\n+ role: Role (CUSTOMER | ADMIN)', '+ register(data: DTO): User\n+ login(credentials): Session\n+ updateProfile(data): Boolean'],
    ['Account', '+ id: String\n+ userId: String [FK]\n+ accountNumber: String\n+ upiId: String\n- upiPinHash: String\n+ failedPinCount: Integer\n+ pinLockedUntil: DateTime\n+ balance: Decimal\n+ dailyLimit: Decimal\n+ dailySpent: Decimal\n+ status: AccountStatus', '+ checkBalance(amount): Boolean\n+ verifyPin(inputPin): Boolean\n+ lockPin(durationMinutes): Void\n+ unlockPin(): Void\n+ updateBalance(delta): Decimal\n+ checkDailyLimit(amount): Boolean'],
    ['Transaction', '+ id: String\n+ referenceNumber: String\n+ senderAccountId: String [FK]\n+ receiverAccountId: String [FK]\n+ amount: Decimal\n+ fee: Decimal\n+ status: TransactionStatus\n+ category: TransactionCategory\n+ senderBalanceAfter: Decimal\n+ receiverBalanceAfter: Decimal\n+ createdAt: DateTime', '+ executeAtomicTransfer(): Result\n+ generateReferenceNumber(): String\n+ validateBounds(): Boolean'],
    ['Beneficiary', '+ id: String\n+ ownerId: String [FK]\n+ beneficiaryName: String\n+ beneficiaryUpi: String\n+ accountNumber: String\n+ nickname: String', '+ validateRecipient(): Boolean\n+ saveBeneficiary(): Beneficiary\n+ deleteBeneficiary(): Boolean'],
    ['Notification', '+ id: String\n+ userId: String [FK]\n+ title: String\n+ message: String\n+ type: NotificationType\n+ isRead: Boolean\n+ createdAt: DateTime', '+ markAsRead(): Void\n+ dispatchAlert(): Void'],
    ['AuditLog', '+ id: String\n+ userId: String [FK]\n+ action: String\n+ details: String / JSON\n+ createdAt: DateTime', '+ recordEvent(action, details): Void\n+ queryAuditTrail(filters): List'],
  ];

  autoTable(doc, {
    startY: 34,
    head: [['Class Entity', 'Attributes & Data Types', 'Methods & Operations']],
    body: classEntities,
    theme: 'grid',
    headStyles: { fillColor: primaryDark, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7, cellPadding: 2.2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 28 },
      1: { cellWidth: 76 },
      2: { cellWidth: 78 },
    },
  });

  // Section 7: UML Use Case Diagram
  const yUc = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.text('B. UML Use Case Diagram - Actors & Use Case Interactions', 14, yUc);

  const useCases = [
    ['Bank Customer (Actor)', 'Authenticate / Sign In\nView Available Balance & Masked Account\nSend Money via UPI\nManage Saved Beneficiaries\nSearch Registered Customer Directory\nView Transaction Passbook\nDownload Statements (PDF / CSV)\nView Spending Analytics\nReceive In-App Notifications', 'Primary actor who transacts funds, manages peer accounts, inspects personal statements, and configures account settings.'],
    ['Bank Administrator (Actor)', 'Authenticate to Executive Portal (/admin)\nMonitor Total System Liquidity & Volume\nFreeze / Unfreeze Customer Accounts\nClear Security PIN Lockouts\nPerform Manual Balance Adjustments\nInspect Central Transaction Ledger\nAudit Complete Security Event Log', 'Administrative actor with elevated privileges to safeguard banking operations, manage fraud risks, and perform audit reviews.'],
    ['Core Banking Engine (System)', 'Resolve Recipient Name (<<include>>)\nAuthorize 6-Digit PIN (<<include>>)\nCheck Daily Limits (<<include>>)\nExecute Atomic Debit/Credit Commit\nRecord Immutable AuditLog Entry', 'Automated backend system executing atomic ACID guarantees, enforcing transaction bounds, and dispatching transaction receipts.'],
  ];

  autoTable(doc, {
    startY: yUc + 4,
    head: [['Actor', 'Associated Use Cases', 'System Role & Operational Scope']],
    body: useCases,
    theme: 'striped',
    headStyles: { fillColor: secondaryDark, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45 },
      1: { cellWidth: 72 },
      2: { cellWidth: 65 },
    },
  });

  drawPageFooter(3);

  // ============================================================================
  // PAGE 4: ACTIVITY DIAGRAM, SEQUENCE DIAGRAM & SECURITY RULES
  // ============================================================================
  doc.addPage();

  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.rect(0, 0, 210, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('5. UML Workflow Diagrams & Security Enforcement', 14, 14);

  // Section 8: Activity Diagram Workflow
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('A. UML Activity Diagram - Money Transfer Execution Workflow', 14, 30);

  const activitySteps = [
    ['Step 1: Recipient Input', 'Customer enters recipient UPI ID (e.g. recipient@bank) or picks from saved beneficiaries.'],
    ['Step 2: Recipient Resolution', 'Asynchronous query verifies account exists and is ACTIVE. Rejects self-transfers immediately.'],
    ['Step 3: Name Verification', 'Compliance check (Question 42): Displays verified registered name in green before confirmation.'],
    ['Step 4: Limits Validation', 'Verifies: ₹1.00 <= Amount <= ₹1,00,000.00 per transaction; Daily utilized + Amount <= ₹2,00,000.00.'],
    ['Step 5: Balance Validation', 'Verifies available balance >= transfer amount. Displays insufficient funds error if unsatisfied.'],
    ['Step 6: PIN Authentication', 'Customer enters 6-digit PIN. 3 consecutive failed attempts trigger automated 15-minute security lockout.'],
    ['Step 7: Atomic Debit & Credit', 'Deducts transfer amount from sender and credits recipient in a single deterministic atomic commit.'],
    ['Step 8: Ledger & Audit Commit', 'Generates TXN-YYYYMMDD-XXXXXX reference number, inserts transaction row, and records AuditLog.'],
    ['Step 9: Receipts & Alerts', 'Dispatches in-app credit/debit notifications and displays modal success receipt to the customer.'],
  ];

  autoTable(doc, {
    startY: 34,
    head: [['Workflow Step', 'System Action & Security Enforcement']],
    body: activitySteps,
    theme: 'grid',
    headStyles: { fillColor: primaryDark, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 48 },
      1: { cellWidth: 134 },
    },
  });

  // Section 9: Sequence Diagram
  const ySeq = (doc as any).lastAutoTable.finalY + 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('B. UML Sequence Diagram - Interaction Sequence (P2P Transfer)', 14, ySeq);

  const seqSteps = [
    ['1. Customer -> Client UI', 'Inputs recipient UPI handle (recipient@bank).'],
    ['2. Client UI -> Banking Engine', 'Calls resolveRecipientUPI(upiId).'],
    ['3. Banking Engine -> Database', 'Executes account lookup where upi_id = recipient@bank.'],
    ['4. Database -> Client UI', 'Returns { valid: true, name: "Recipient Account" }. Renders green verified badge.'],
    ['5. Customer -> Client UI', 'Enters amount (e.g. ₹500), category, note, and 6-digit PIN.'],
    ['6. Client UI -> Banking Engine', 'Calls executeMoneyTransfer(recipient, amount, pin, note).'],
    ['7. Banking Engine -> Security', 'Verifies PIN hash, checks balance, and validates ₹2,00,000 daily limit.'],
    ['8. Banking Engine -> Database', 'Executes atomic balance update, inserts transaction record, and writes AuditLog.'],
    ['9. Banking Engine -> Client UI', 'Returns { success: true, referenceNumber, updatedBalance }. Renders success receipt.'],
  ];

  autoTable(doc, {
    startY: ySeq + 4,
    head: [['Sequence Message Call', 'Interaction Details & Payload']],
    body: seqSteps,
    theme: 'striped',
    headStyles: { fillColor: secondaryDark, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 127 },
    },
  });

  // Section 10: Security Rules & Limits Summary
  const yRules = (doc as any).lastAutoTable.finalY + 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('C. System Rules & Financial Boundary Enforcements', 14, yRules);

  const rulesData = [
    ['Minimum Transaction Limit', 'INR 1.00 per transfer (strictly enforced in engine & UI)'],
    ['Maximum Per-Transaction Limit', 'INR 1,00,000.00 ceiling per individual transfer'],
    ['Daily Cumulative Limit', 'INR 2,00,000.00 per 24-hour cycle with live visual utilization gauge'],
    ['Transaction Fee', 'INR 0.00 (Zero Transaction Fee)'],
    ['PIN Security & Lockout', '3 consecutive invalid PIN entries trigger an automated 15-minute temporary lockout'],
    ['Double-Spending Prevention', 'Deterministic atomic debit/credit operations with single-commit serialization'],
  ];

  autoTable(doc, {
    startY: yRules + 4,
    head: [['System Parameter', 'Enforced Operational Specification']],
    body: rulesData,
    theme: 'grid',
    headStyles: { fillColor: primaryDark, fontSize: 8, fontStyle: 'bold' },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { cellWidth: 127 },
    },
  });

  drawPageFooter(4);

  // Write output PDF
  const outputPath = path.join(process.cwd(), 'UML_AND_ARCHITECTURE_SPEC.pdf');
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Successfully generated Master UML & Modules PDF: ${outputPath}`);
}

generateMasterSpecificationPdf().catch((e) => {
  console.error('Error generating PDF:', e);
  process.exit(1);
});
