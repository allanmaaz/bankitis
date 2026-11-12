# Team-9: Banking Management System

A full-stack, enterprise-grade Online Banking Management and UPI Funds Transfer application built for high reliability, strict financial consistency, and intuitive user experience.

![Team-9 Banking System](https://img.shields.io/badge/Next.js-16.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-336791?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 🌟 Highlights & Key Features

- **Atomic Transfers & Zero Double-Spending:** Transactions run inside a PostgreSQL serializable transaction using explicit row-level locking (`SELECT ... FOR UPDATE`) in deterministic order to prevent race conditions and deadlocks.
- **Recipient Verification (Question 42):** Real-time UPI resolution that verifies and displays the recipient's registered bank name before any money is transferred.
- **Dedicated 6-Digit UPI PIN:** Separate bcrypt-hashed PIN authorization for every financial transaction with an automatic 15-minute temporary lockout after 3 consecutive failed attempts.
- **Tiered Limits (Question 43):**
  - Minimum transfer: **₹1.00**
  - Maximum per-transaction: **₹1,00,000.00**
  - Daily cumulative ceiling: **₹2,00,000.00** (with real-time progress indicator)
  - Transaction fee: **₹0.00**
- **Beneficiary Management (Questions 44 & 45):**
  - Automatic identity verification before saving.
  - Adding via direct UPI ID or Registered Customer Directory search.
  - No PIN required merely to save beneficiaries.
- **Statement Downloads (Question 47):**
  - **Formal PDF Statement:** Branded with bank header, watermark, customer details, opening/closing balance, and debit/credit ledger (`jsPDF` + `jspdf-autotable`).
  - **CSV Export:** RFC 4180 spreadsheet export (`PapaParse`).
- **Interactive Spending Analytics:** Visual breakdown of monthly cash flow (Credits vs Debits) and expense categorization (Food, Rent, Utilities, Groceries) powered by `Recharts`.
- **In-App Notifications & Audit Logs:** Real-time notification center (debits, credits, security alerts) and an immutable `AuditLog` trail.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **PostgreSQL**: Local instance or cloud database (Neon, Supabase, Railway)

### 2. Setup Environment
Copy the example environment configuration:
```bash
cp .env.example .env
```
Ensure `DATABASE_URL` points to your PostgreSQL instance:
```env
DATABASE_URL="postgresql://apple@localhost:5432/banking_db"
JWT_SECRET="banking-system-team9-secure-token-secret-2026-xyz-random-123456"
NEXTAUTH_SECRET="banking-system-team9-secure-token-secret-2026-xyz-random-123456"
```

### 3. Initialize Database & Seed
Push the Prisma schema to PostgreSQL and populate realistic demo accounts:
```bash
npx prisma db push
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Automated Integration Tests
```bash
npm test
```
Runs 8 automated tests verifying recipient resolution, limit enforcement, invalid PIN rejection, atomic row-level locking, and statement generation.

---

## 🔑 Demo & Admin Credentials

The sign-in page includes **1-Click Demo Login** buttons for instant testing:

| User Type | Full Name | Registered Email | UPI Handle | 6-Digit PIN | Initial Balance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **System Admin** | **Administrator** | `admin@bank.com` | `admin@bank` | `999999` | Central Bank Reserves |
| Customer | **Maaz Khan** | `maaz@bank.com` | `maaz@bank` | `123456` | ₹75,000.00 |
| Customer | **Priya Sharma** | `priya@bank.com` | `priya@bank` | `654321` | ₹52,000.00 |
| Customer | **Rahul Verma** | `rahul@bank.com` | `rahul@bank` | `112233` | ₹38,900.00 |
| Customer | **Ananya Iyer** | `ananya@bank.com` | `ananya@bank` | `998877` | ₹1,12,500.00 |

*All accounts share the login password:* `Password@123`

---

## 🛡️ Bank Admin Console (`/admin`)

Access the Executive Admin Console at: **`http://localhost:3000/admin`**  
*(Or log in as `admin@bank.com` and click the **Admin Console** badge in the navbar)*

### Admin Capabilities:
1. **Bank Liquidity & Health Overview:** Real-time visibility into total customer deposits, total system transfer volume, and transaction count.
2. **Account Freeze / Unfreeze:** One-click security lockout for suspicious accounts that temporarily pauses outgoing transfers and notifies the customer.
3. **Administrative Balance Adjustments:** Credit or debit balance corrections directly on customer accounts with mandatory reason and immutable audit trail.
4. **Central Transaction Ledger:** Filter and inspect all transfers across all customers.
5. **System Security Audit Trail:** Live stream of logins, failed PIN attempts, account freezes, and admin actions.

---

The sign-in page includes **1-Click Demo Login** buttons for instant testing:

| Customer Name | Registered Email | Default UPI ID | 6-Digit PIN | Initial Balance |
| :--- | :--- | :--- | :--- | :--- |
| **Maaz Khan** | `maaz@bank.com` | `maaz@bank` | `123456` | ₹75,000.00 |
| **Priya Sharma** | `priya@bank.com` | `priya@bank` | `654321` | ₹52,000.00 |
| **Rahul Verma** | `rahul@bank.com` | `rahul@bank` | `112233` | ₹38,900.00 |
| **Ananya Iyer** | `ananya@bank.com` | `ananya@bank` | `998877` | ₹1,12,500.00 |

*All accounts share the login password:* `Password@123`

You can also use the **Create Account** tab to self-register any new customer, which immediately provisions a unique account number, custom UPI ID, and an initial test deposit of **₹50,000.00**.

---

## 🏗 Architecture & Tech Stack

```
src/
├── app/
│   ├── api/
│   │   └── statement/
│   │       ├── csv/route.ts       # CSV Statement Generator (PapaParse)
│   │       └── pdf/route.ts       # Bank-branded PDF Statement (jsPDF)
│   ├── actions.ts                 # Next.js Server Actions (Auth, Transfers, Beneficiaries)
│   ├── globals.css                # Tailwind CSS v4 & accessible dialog rules
│   ├── layout.tsx                 # Root Layout
│   └── page.tsx                   # Server Component: Dashboard & Auth router
├── components/
│   ├── Navbar.tsx                 # Top navigation, verified badge, notifications popover
│   ├── BalanceCard.tsx            # Executive card, balance eye toggle, daily limit bar
│   ├── SendMoneyModal.tsx         # Multi-step UPI transfer modal with PIN & receipt
│   ├── BeneficiariesModal.tsx     # Add/Manage beneficiaries with auto-verification
│   ├── DirectoryModal.tsx         # Registered customer directory search
│   ├── TransactionHistory.tsx     # Unlimited passbook with advanced filters & exports
│   ├── SpendingAnalytics.tsx      # Recharts monthly cash flow and expense categories
│   ├── AuditLogView.tsx           # Immutable security audit trail
│   └── AuthTabs.tsx               # Sign in, 1-click demo logins & account opening
└── lib/
    ├── auth.ts                    # Session cookies, bcrypt hashing, JWT (jose)
    ├── banking.ts                 # Atomic transfer engine (SELECT FOR UPDATE)
    ├── beneficiaries.ts           # Beneficiary management & directory lookups
    ├── notifications.ts           # In-app notifications & transactional alerts
    ├── prisma.ts                  # Prisma Client singleton
    ├── transactions.ts            # Query engine for filtered history & analytics
    └── utils.ts                   # Formatting currency (₹ INR), dates & account masking
```

---

## 📋 Coursework & Project Verification

- Product Requirements Document (PRD): [`PRD.md`](./PRD.md)
- Database Definition: [`prisma/schema.prisma`](./prisma/schema.prisma)
- Automated Test Suite: [`tests/test-banking-flow.ts`](./tests/test-banking-flow.ts)

*Built by Team-9 for Software Engineering Coursework.*
