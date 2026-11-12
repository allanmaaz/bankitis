# Bankitis — Online Banking & UPI Core

A minimal, high-reliability Online Banking & UPI Transfer application built with pure React, Tailwind CSS, and Vite. Designed with clean fintech principles, deterministic transfer state, and zero credential leakage.

**Live Production Deployment:** [https://bankitis.pages.dev](https://bankitis.pages.dev)  
**Admin Console:** [https://bankitis.pages.dev/admin](https://bankitis.pages.dev/admin)

---

## 🌟 Core Highlights

- **Pure React Engine:** Client-side state machine with persistent storage, zero external runtime lock-ins, and instantaneous response times.
- **Recipient Verification:** Real-time UPI resolution that verifies and displays the recipient's registered bank name before initiating transfers.
- **PIN Security & Lockout:** 6-digit transaction PIN protection with automatic 15-minute temporary lockout after 3 consecutive failed attempts.
- **Transaction Bounds & Limits:**
  - Minimum transfer: **₹1.00**
  - Maximum per-transaction: **₹1,00,000.00**
  - Daily cumulative ceiling: **₹2,00,000.00** (with real-time progress gauge)
  - Transaction fee: **₹0.00**
- **Beneficiary Directory:** Save verified peers with instant resolution.
- **Statement Downloads:**
  - **PDF Statement:** Branded with bank header, customer details, opening/closing balance, and full ledger (`jsPDF` + `jspdf-autotable`).
  - **CSV Export:** RFC 4180 spreadsheet export (`PapaParse`).
- **Spending Analytics:** Monthly cash flow analysis and category breakdowns.
- **Executive Admin Console:** Complete administrative visibility, account freeze/unfreeze toggles, balance adjustments, and audit trail.

---

## 🔐 Credentials & Access

In accordance with strict security standards, all credentials and sample phone numbers have been completely stripped from public web UI forms and placeholders. Evaluators and examiners can refer to the official document:

- **[CREDENTIALS.pdf](./CREDENTIALS.pdf)** — Contains confidential test account logins, 6-digit PINs, and system administrator access credentials.

---

## 📐 Architecture & UML Diagrams

- **[UML_AND_ARCHITECTURE_SPEC.pdf](./UML_AND_ARCHITECTURE_SPEC.pdf)** — Official PDF document with Class, Sequence, Activity, and 3-Tier Architecture specifications.
- **[`DIAGRAMS.md`](./DIAGRAMS.md)** — Mermaid diagrams and guide for 1-click import into StarUML, Rational Rose, and PlantText.
- Dedicated source `.puml` files available in [`diagrams/`](./diagrams/):
  - `diagrams/ClassDiagram.puml`
  - `diagrams/ActivityDiagram.puml`
  - `diagrams/SequenceDiagram.puml`
  - `diagrams/UseCaseDiagram.puml`
  - `diagrams/SystemArchitecture.puml`
  - `diagrams/ALL_UML_DIAGRAMS.puml`

---

## 🚀 Development & Deployment

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Deploy to Cloudflare Pages
```bash
npx wrangler pages deploy dist --project-name bankitis
```

---

*Bankitis Online Banking Application.*
