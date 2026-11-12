# Software Engineering Architecture & UML Specification
## Bankitis: Online Banking System

This document contains the official **System Architecture Diagram**, **UML Class Diagram**, **UML Activity Diagram**, **UML Use Case Diagram**, and **UML Sequence Diagram** required for academic, lab viva, and technical evaluation.

### 📁 Direct Diagram Files for StarUML, Rational Rose, & Visual Paradigm
You can copy and paste or import these dedicated `.puml` source files directly into **StarUML**, **Rational Rose**, **Visual Paradigm**, or paste into **[PlantText.com](https://www.planttext.com/)** / **[PlantUML Server](https://www.plantuml.com/plantuml/uml/)** to export high-resolution PNGs and PDFs:

| Diagram Name | Dedicated File (.puml) | Best Used In |
| :--- | :--- | :--- |
| **Combined All Diagrams** | [`diagrams/ALL_UML_DIAGRAMS.puml`](./diagrams/ALL_UML_DIAGRAMS.puml) | StarUML, PlantText, VS Code PlantUML |
| **UML Class Diagram** | [`diagrams/ClassDiagram.puml`](./diagrams/ClassDiagram.puml) | StarUML, Rational Rose, Visual Paradigm |
| **UML Activity Diagram** | [`diagrams/ActivityDiagram.puml`](./diagrams/ActivityDiagram.puml) | StarUML, PlantText (Workflow Viva) |
| **3-Tier System Architecture** | [`diagrams/SystemArchitecture.puml`](./diagrams/SystemArchitecture.puml) | Architecture Presentation & Report |
| **UML Use Case Diagram** | [`diagrams/UseCaseDiagram.puml`](./diagrams/UseCaseDiagram.puml) | StarUML, Rational Rose Use-Case View |
| **UML Sequence Diagram** | [`diagrams/SequenceDiagram.puml`](./diagrams/SequenceDiagram.puml) | StarUML, Rational Rose Sequence View |

#### ⚡ How to Paste into StarUML / PlantText (30 Seconds):
1. **Option A (Instant Online Export):** Go to [PlantText.com](https://www.planttext.com/), open any `.puml` file above, copy all text, paste it into the editor, and click **Refresh** &rarr; Export as PNG/SVG.
2. **Option B (StarUML):** In StarUML, install the PlantUML extension (**Tools &rarr; Extension Manager &rarr; search "PlantUML"**), paste the diagram code, or use the class/activity/sequence tools using the entity specifications below.
3. **Option C (Rational Rose):** Import via XMI or use the Class & Activity specifications detailed in Section 2 & 3.

---

## 1. System Architecture Diagram (3-Tier Model)

The banking application adheres to a decoupled, secure **3-Tier Enterprise Architecture**:
1. **Presentation Tier (Client Layer):** Mobile-responsive Next.js React frontend with Tailwind CSS and accessible dialog controls.
2. **Application / Business Logic Tier:** Next.js Server Actions, Zod payload validators, JOSE authentication middleware, and the atomic banking transfer engine.
3. **Data & Persistence Tier:** PostgreSQL relational database with row-level locking (`SELECT ... FOR UPDATE`), managed by Prisma ORM.

```mermaid
graph TD
    subgraph Presentation_Layer ["1. Presentation Layer (Client Browser)"]
        UI_Dashboard["Banking Dashboard & Passbook"]
        UI_Transfer["UPI Transfer Modal (PIN Protected)"]
        UI_Admin["Bank Admin Console (/admin)"]
        UI_Exports["PDF / CSV Statement Exporters"]
    end

    subgraph Application_Layer ["2. Application & Business Logic Layer (Next.js Server)"]
        Middleware["Security & Session Middleware (jose JWT)"]
        Router["Route Handlers & Server Actions"]
        BankingEngine["Core Banking Engine (Transfer, Validation, Limits)"]
        AuthModule["Auth & PIN Hashing Engine (bcryptjs)"]
        AdminModule["Admin Control Services (Freeze, Balance Adjust)"]
        NotifService["Notification & Alert Dispatcher"]
    end

    subgraph Persistence_Layer ["3. Data & Persistence Layer (PostgreSQL Database)"]
        PrismaORM["Prisma ORM (Schema & Query Builder)"]
        DB[("PostgreSQL Database (Neon / Local)")]
        subgraph Tables ["Database Relational Tables"]
            T_Users["User Table"]
            T_Accounts["Account Table (Row-Level Locked)"]
            T_Txn["Transaction Ledger"]
            T_Beneficiary["Beneficiary Table"]
            T_Audit["Immutable AuditLog Table"]
            T_Notif["Notification Table"]
        end
    end

    UI_Dashboard -->|HTTPS / Session Cookie| Middleware
    UI_Transfer -->|HTTPS / Encrypted Payload| Middleware
    UI_Admin -->|HTTPS / Role: ADMIN| Middleware
    UI_Exports -->|HTTPS Request| Middleware

    Middleware --> Router
    Router --> BankingEngine
    Router --> AuthModule
    Router --> AdminModule

    BankingEngine -->|ACID: SELECT FOR UPDATE| PrismaORM
    AdminModule --> PrismaORM
    AuthModule --> PrismaORM
    BankingEngine --> NotifService

    PrismaORM --> DB
    DB --- Tables
```

---

## 2. UML Class Diagram (Domain & Entity Model)

The class diagram below depicts the system data entities, attributes, data types, visibility, and relational associations:

```mermaid
classDiagram
    direction TB

    class User {
        +String id
        +String fullName
        +String email
        +String phoneNumber
        +String passwordHash
        +Role role
        +DateTime createdAt
        +DateTime updatedAt
        +register(data) User
        +login(credentials) Session
    }

    class Account {
        +String id
        +String accountNumber
        +String upiId
        +String upiPinHash
        +Int failedPinCount
        +DateTime pinLockedUntil
        +Decimal balance
        +AccountStatus status
        +String userId
        +checkBalance(amount) Boolean
        +verifyPin(enteredPin) Boolean
        +lockAccount(duration) Void
    }

    class Beneficiary {
        +String id
        +String nickname
        +String beneficiaryUpi
        +String beneficiaryName
        +String ownerId
        +DateTime createdAt
        +addBeneficiary(upi, name) Beneficiary
        +removeBeneficiary(id) Void
    }

    class Transaction {
        +String id
        +String referenceNumber
        +String idempotencyKey
        +Decimal amount
        +Decimal fee
        +TransactionStatus status
        +TransactionCategory category
        +String note
        +String senderAccountId
        +String receiverAccountId
        +Decimal senderBalanceAfter
        +Decimal receiverBalanceAfter
        +DateTime createdAt
        +executeAtomicTransfer() Result
    }

    class Notification {
        +String id
        +String title
        +String message
        +String type
        +Boolean isRead
        +String userId
        +DateTime createdAt
        +markAsRead() Void
    }

    class AuditLog {
        +String id
        +String action
        +String ipAddress
        +String userAgent
        +Json details
        +String userId
        +DateTime createdAt
        +recordLog(action, details) Void
    }

    class Role {
        <<enumeration>>
        CUSTOMER
        ADMIN
    }

    class AccountStatus {
        <<enumeration>>
        ACTIVE
        FROZEN
        SUSPENDED
    }

    class TransactionStatus {
        <<enumeration>>
        COMPLETED
        PENDING
        FAILED
        REVERSED
    }

    class TransactionCategory {
        <<enumeration>>
        TRANSFER
        RENT
        GROCERIES
        UTILITIES
        DINING
        ENTERTAINMENT
        SALARY
        OTHER
    }

    User "1" *-- "1..*" Account : owns
    User "1" *-- "0..*" Beneficiary : manages
    User "1" *-- "0..*" Notification : receives
    User "1" *-- "0..*" AuditLog : triggers

    Account "1" <-- "0..*" Transaction : senderAccount
    Account "1" <-- "0..*" Transaction : receiverAccount

    User --> Role : classified by
    Account --> AccountStatus : status is
    Transaction --> TransactionStatus : state is
    Transaction --> TransactionCategory : tagged with
```

---

## 3. UML Activity Diagram (Money Transfer & UPI Verification Workflow)

This activity diagram models the step-by-step logic executed during an online funds transfer, including validation rules, security checks, and concurrency control:

```mermaid
flowchart TD
    Start(["● Start: Customer Initiates Transfer"]) --> InputUPI["1. Customer enters Recipient UPI ID or selects Beneficiary"]
    InputUPI --> Resolve["2. System executes asynchronous recipient lookup"]
    
    Resolve --> CheckRecipient{"Recipient Exists in Bank & Active?"}
    CheckRecipient -- "No" --> ErrorRecipient["Display error: UPI ID not registered"]
    ErrorRecipient --> InputUPI
    
    CheckRecipient -- "Yes" --> SelfCheck{"Is Recipient Same as Sender?"}
    SelfCheck -- "Yes" --> ErrorSelf["Display error: Self-transfer not permitted"]
    ErrorSelf --> InputUPI
    
    SelfCheck -- "No" --> ShowName["3. Display Verified Recipient Name (Question 42)"]
    ShowName --> InputAmount["4. Customer enters Transfer Amount (₹), Category & Note"]
    
    InputAmount --> CheckLimits{"Amount between ₹1 and ₹1,00,000?"}
    CheckLimits -- "No" --> ErrorLimit["Display error: Amount violates transaction limits"]
    ErrorLimit --> InputAmount
    
    CheckLimits -- "Yes" --> CheckDaily{"Amount + Today's Utilized ≤ ₹2,00,000?"}
    CheckDaily -- "No" --> ErrorDaily["Display error: Daily transfer limit exceeded"]
    ErrorDaily --> InputAmount
    
    CheckDaily -- "Yes" --> CheckBal{"Available Balance ≥ Transfer Amount?"}
    CheckBal -- "No" --> ErrorBal["Display error: Insufficient account funds"]
    ErrorBal --> InputAmount
    
    CheckBal -- "Yes" --> PromptPIN["5. Customer enters 6-Digit Transaction PIN"]
    PromptPIN --> CheckLockout{"Is Account Currently Locked?"}
    CheckLockout -- "Yes" --> ErrorLock["Display error: Account locked due to 3 failed attempts"]
    ErrorLock --> EndFail(["● End: Transaction Aborted"])
    
    CheckLockout -- "No" --> VerifyPIN{"Verify PIN with bcrypt hash"}
    VerifyPIN -- "Invalid" --> IncrFail["Increment Failed PIN Counter"]
    IncrFail --> Check3Times{"Failed Count ≥ 3?"}
    Check3Times -- "Yes" --> Lock15["Lock account transfers for 15 minutes"]
    Lock15 --> LogLock["Record Security Audit Log"]
    LogLock --> EndFail
    Check3Times -- "No" --> RetryPIN["Display error: Incorrect PIN, remaining attempts"]
    RetryPIN --> PromptPIN
    
    VerifyPIN -- "Valid" --> LockDB["6. Acquire Row-Level Lock: SELECT FOR UPDATE (Prisma ACID)"]
    LockDB --> DebitSender["7. Atomic Balance Update: sender.balance -= amount"]
    DebitSender --> CreditReceiver["8. Atomic Balance Update: receiver.balance += amount"]
    CreditReceiver --> CreateTxn["9. Insert Transaction record with Ref: TXN-YYYYMMDD-XXXXXX"]
    CreateTxn --> CreateAudits["10. Insert Audit Logs & Dispatch In-App/Email Alerts"]
    CreateAudits --> ShowReceipt["11. Render Official Payment Receipt & Update UI Balance"]
    ShowReceipt --> EndSuccess(["● End: Transfer Completed Successfully"])
```

---

## 4. UML Use Case Diagram

The use case diagram highlights system capabilities separated by user actors:

```mermaid
flowchart LR
    Customer((Registered Customer))
    Admin((Bank Administrator))
    CoreEngine((Core Banking Engine))

    subgraph Banking_System ["Bankitis Online Banking System"]
        UC1["Sign In / Authenticate"]
        UC2["View Account Balance & Masked No."]
        UC3["Send Money via UPI"]
        UC4["Resolve Recipient Name"]
        UC5["Authorize with 6-Digit PIN"]
        UC6["Add / Manage Beneficiaries"]
        UC7["Browse Registered User Directory"]
        UC8["View Transaction Passbook"]
        UC9["Apply Advanced Filters"]
        UC10["Download PDF / CSV Statements"]
        UC11["View Spending Analytics Charts"]
        UC12["Receive Alerts & Notifications"]
        
        UC13["Monitor Total Bank Liquidity"]
        UC14["Freeze / Unfreeze Customer Accounts"]
        UC15["Execute Balance Adjustments"]
        UC16["Inspect Central Transaction Ledger"]
        UC17["Inspect System Audit Trail"]
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC6
    Customer --> UC7
    Customer --> UC8
    Customer --> UC10
    Customer --> UC11
    Customer --> UC12

    UC3 ..> UC4 : <<include>>
    UC3 ..> UC5 : <<include>>
    UC8 ..> UC9 : <<extend>>

    Admin --> UC1
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16
    Admin --> UC17

    CoreEngine --> UC4
    CoreEngine --> UC5
    CoreEngine --> UC12
```

---

## 5. UML Sequence Diagram (End-to-End Transfer Execution)

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Bank Customer
    participant UI as Dashboard Web Client
    participant API as Next.js Server Action
    participant DB as PostgreSQL (Prisma)
    participant Notif as Alert Dispatcher

    Customer->>UI: Enter Recipient UPI ID (e.g. recipient@bank)
    UI->>API: resolveRecipientAction("recipient@bank")
    API->>DB: Query Account by upiId
    DB-->>API: Return account details & user name
    API-->>UI: Return { success: true, recipientName: "Recipient Account" }
    UI-->>Customer: Display verified name badge in green

    Customer->>UI: Enter Amount (₹500), Category (Dining), and Note
    Customer->>UI: Click "Proceed to PIN"
    UI->>UI: Validate amount (₹1 ≤ amt ≤ ₹1,00,000, daily ≤ ₹2,00,000)
    Customer->>UI: Input 6-Digit UPI PIN & Click "Confirm & Pay"

    UI->>API: transferMoneyAction(senderId, "recipient@bank", 500, pin, category, note)
    
    rect rgb(240, 248, 255)
    Note over API,DB: Atomic Database Transaction (ACID)
    API->>DB: Verify bcrypt(pin, upiPinHash)
    API->>DB: SELECT id FROM "Account" WHERE id IN (sender, receiver) FOR UPDATE
    API->>DB: Check lockedSender.balance >= 500
    API->>DB: UPDATE "Account" SET balance = balance - 500 WHERE id = sender
    API->>DB: UPDATE "Account" SET balance = balance + 500 WHERE id = receiver
    API->>DB: INSERT INTO "Transaction" (TXN-20261112-XXXXXX, amount: 500)
    API->>DB: INSERT INTO "AuditLog" (action: "TRANSFER_EXECUTED")
    API->>DB: INSERT INTO "Notification" (for sender & receiver)
    end

    DB-->>API: Transaction Committed Successfully
    API->>Notif: Dispatch debit/credit alerts
    API-->>UI: Return { success: true, referenceNumber, newBalance }
    UI-->>Customer: Render Success Receipt modal & update live balance
```

---

*Bankitis Online Banking Architecture Specification.*

