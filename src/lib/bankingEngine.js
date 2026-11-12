// Bankitis - Core Pure React State & Banking Engine
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

const STORAGE_KEY = 'bankitis_data_v3';

// Initial preloaded database matching coursework specification
const INITIAL_DATA = {
  users: [
    {
      id: 'usr_admin',
      name: 'System Administrator',
      email: 'admin@bank.com',
      password: 'Password@123',
      role: 'ADMIN',
      pin: '999999',
      phone: '+91 99999 00000',
    },
    {
      id: 'usr_maaz',
      name: 'Mohammed Maaz',
      email: 'maaz@bank.com',
      password: 'Password@123',
      role: 'CUSTOMER',
      pin: '123456',
      phone: '+91 98765 00001',
    },
    {
      id: 'usr_devika',
      name: 'Devika',
      email: 'devika@bank.com',
      password: 'Password@123',
      role: 'CUSTOMER',
      pin: '123456',
      phone: '+91 98765 00002',
    },
    {
      id: 'usr_vivek',
      name: 'Vivek',
      email: 'vivek@bank.com',
      password: 'Password@123',
      role: 'CUSTOMER',
      pin: '123456',
      phone: '+91 98765 00003',
    },
    {
      id: 'usr_apoorva',
      name: 'Apoorva',
      email: 'apoorva@bank.com',
      password: 'Password@123',
      role: 'CUSTOMER',
      pin: '123456',
      phone: '+91 98765 00004',
    },
    {
      id: 'usr_imthebest',
      name: 'imthebest',
      email: 'imthebest@bank.com',
      password: 'Password@123',
      role: 'CUSTOMER',
      pin: '123456',
      phone: '+91 98765 00005',
    },
  ],
  accounts: [
    {
      id: 'acc_maaz',
      userId: 'usr_maaz',
      accountNumber: 'ACC1000849201',
      upiId: 'maaz@bank',
      balance: 75000,
      dailyLimit: 200000,
      dailySpent: 0,
      status: 'ACTIVE',
      failedPinAttempts: 0,
      lockedUntil: null,
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'acc_devika',
      userId: 'usr_devika',
      accountNumber: 'ACC1000849202',
      upiId: 'devika@bank',
      balance: 52000,
      dailyLimit: 200000,
      dailySpent: 0,
      status: 'ACTIVE',
      failedPinAttempts: 0,
      lockedUntil: null,
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'acc_vivek',
      userId: 'usr_vivek',
      accountNumber: 'ACC1000849203',
      upiId: 'vivek@bank',
      balance: 38900,
      dailyLimit: 200000,
      dailySpent: 0,
      status: 'ACTIVE',
      failedPinAttempts: 0,
      lockedUntil: null,
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'acc_apoorva',
      userId: 'usr_apoorva',
      accountNumber: 'ACC1000849204',
      upiId: 'apoorva@bank',
      balance: 64500,
      dailyLimit: 200000,
      dailySpent: 0,
      status: 'ACTIVE',
      failedPinAttempts: 0,
      lockedUntil: null,
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 'acc_imthebest',
      userId: 'usr_imthebest',
      accountNumber: 'ACC1000849205',
      upiId: 'imthebest@bank',
      balance: 100000,
      dailyLimit: 200000,
      dailySpent: 0,
      status: 'ACTIVE',
      failedPinAttempts: 0,
      lockedUntil: null,
      createdAt: '2026-10-01T10:00:00Z',
    },
  ],
  beneficiaries: [
    {
      id: 'ben_1',
      userId: 'usr_maaz',
      name: 'Devika',
      upiId: 'devika@bank',
      accountNumber: 'ACC1000849202',
      nickname: 'Devika',
    },
    {
      id: 'ben_2',
      userId: 'usr_maaz',
      name: 'Vivek',
      upiId: 'vivek@bank',
      accountNumber: 'ACC1000849203',
      nickname: 'Vivek',
    },
    {
      id: 'ben_3',
      userId: 'usr_maaz',
      name: 'Apoorva',
      upiId: 'apoorva@bank',
      accountNumber: 'ACC1000849204',
      nickname: 'Apoorva',
    },
    {
      id: 'ben_4',
      userId: 'usr_maaz',
      name: 'imthebest',
      upiId: 'imthebest@bank',
      accountNumber: 'ACC1000849205',
      nickname: 'imthebest',
    },
    {
      id: 'ben_5',
      userId: 'usr_devika',
      name: 'Mohammed Maaz',
      upiId: 'maaz@bank',
      accountNumber: 'ACC1000849201',
      nickname: 'Mohammed Maaz',
    },
  ],
  transactions: [
    {
      id: 'txn_init_1',
      reference: 'TXN-20261110-8X91PZ',
      senderAccountId: 'acc_devika',
      receiverAccountId: 'acc_maaz',
      amount: 2500,
      fee: 0,
      status: 'SUCCESS',
      category: 'SERVICES',
      description: 'Project consultation fee',
      senderBalanceAfter: 52000,
      receiverBalanceAfter: 75000,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'txn_init_2',
      reference: 'TXN-20261111-4K29MQ',
      senderAccountId: 'acc_imthebest',
      receiverAccountId: 'acc_maaz',
      amount: 5000,
      fee: 0,
      status: 'SUCCESS',
      category: 'BILLS',
      description: 'Shared server deployment split',
      senderBalanceAfter: 100000,
      receiverBalanceAfter: 72500,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  notifications: [
    {
      id: 'notif_1',
      userId: 'usr_maaz',
      title: 'Payment Received',
      message: '₹2,500.00 received from Devika (devika@bank). Ref: TXN-20261110-8X91PZ',
      type: 'TRANSFER_RECEIVED',
      read: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  auditLogs: [
    {
      id: 'aud_1',
      userId: 'usr_admin',
      action: 'SYSTEM_BOOTSTRAP',
      details: 'Bankitis Online Banking Engine initialized.',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ],
};

// Persistence Helpers
export function loadDatabase() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading banking storage', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
  return INITIAL_DATA;
}

export function saveDatabase(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving banking storage', e);
  }
}

// Authentication
export function authenticateUser(email, password) {
  const db = loadDatabase();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.password !== password) {
    return { success: false, error: 'Invalid email address or password.' };
  }
  return { success: true, user };
}

export function registerCustomer({ name, email, password, phone, upiHandle, pin }) {
  const db = loadDatabase();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return { success: false, error: 'A customer account with this email already exists.' };
  }

  const cleanHandle = upiHandle.toLowerCase().replace(/[^a-z0-9_]/g, '');
  const upiId = `${cleanHandle}@bank`;
  const existingUpi = db.accounts.find(a => a.upiId.toLowerCase() === upiId);
  if (existingUpi) {
    return { success: false, error: `UPI ID ${upiId} is already taken. Please choose another.` };
  }

  const userId = `usr_${Date.now()}`;
  const accountId = `acc_${Date.now()}`;
  const accountNumber = `ACC1000${Math.floor(100000 + Math.random() * 900000)}`;

  const newUser = {
    id: userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: 'CUSTOMER',
    pin,
    phone: phone.trim(),
  };

  const newAccount = {
    id: accountId,
    userId,
    accountNumber,
    upiId,
    balance: 5000, // Welcome deposit
    dailyLimit: 200000,
    dailySpent: 0,
    status: 'ACTIVE',
    failedPinAttempts: 0,
    lockedUntil: null,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  db.accounts.push(newAccount);

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    userId,
    action: 'CUSTOMER_REGISTRATION',
    details: `Customer ${name} registered. Account ${accountNumber} provisioned with ₹5,000 balance.`,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return { success: true, user: newUser };
}

// Recipient Name Resolution (Question 42 Requirement)
export function resolveRecipientUPI(upiId, currentUserId) {
  if (!upiId) return { valid: false, error: 'Please enter a UPI ID' };
  const cleanUPI = upiId.trim().toLowerCase();
  const formattedUPI = cleanUPI.includes('@') ? cleanUPI : `${cleanUPI}@bank`;

  const db = loadDatabase();
  const targetAccount = db.accounts.find(a => a.upiId.toLowerCase() === formattedUPI);

  if (!targetAccount) {
    return { valid: false, error: `UPI ID "${formattedUPI}" is not registered in this bank.` };
  }

  const targetUser = db.users.find(u => u.id === targetAccount.userId);
  if (!targetUser) {
    return { valid: false, error: 'Recipient account record not found.' };
  }

  if (targetAccount.userId === currentUserId) {
    return { valid: false, error: 'Self-transfers to your own UPI ID are not allowed.' };
  }

  if (targetAccount.status === 'FROZEN') {
    return { valid: false, error: 'Recipient account is frozen and cannot receive funds.' };
  }

  return {
    valid: true,
    upiId: targetAccount.upiId,
    name: targetUser.name,
    accountNumberMasked: `•••• ${targetAccount.accountNumber.slice(-4)}`,
    account: targetAccount,
  };
}

// Atomic Money Transfer Engine
export function executeMoneyTransfer({
  senderUserId,
  recipientUpiId,
  amount,
  pin,
  note = 'P2P Transfer',
  category = 'GENERAL',
}) {
  const db = loadDatabase();
  const parsedAmount = parseFloat(amount);

  // 1. Validate Amount bounds (Question 43)
  if (isNaN(parsedAmount) || parsedAmount < 1) {
    return { success: false, error: 'Minimum transfer amount is ₹1.00.' };
  }
  if (parsedAmount > 100000) {
    return { success: false, error: 'Maximum per-transaction transfer limit is ₹1,00,000.00.' };
  }

  // 2. Fetch sender account & user
  const senderAccount = db.accounts.find(a => a.userId === senderUserId);
  const senderUser = db.users.find(u => u.id === senderUserId);

  if (!senderAccount || !senderUser) {
    return { success: false, error: 'Sender banking account not found.' };
  }

  if (senderAccount.status === 'FROZEN') {
    return { success: false, error: 'Your account is FROZEN. All outgoing transfers are blocked.' };
  }

  // 3. Check Lockout Status
  if (senderAccount.lockedUntil && new Date(senderAccount.lockedUntil) > new Date()) {
    const minsLeft = Math.ceil((new Date(senderAccount.lockedUntil) - new Date()) / 60000);
    return {
      success: false,
      error: `Security Lockout Active. 3 incorrect PIN attempts. Try again in ${minsLeft} minute(s) or contact Administrator.`,
    };
  }

  // 4. Verify 6-Digit Transaction PIN
  if (senderUser.pin !== pin) {
    senderAccount.failedPinAttempts = (senderAccount.failedPinAttempts || 0) + 1;
    if (senderAccount.failedPinAttempts >= 3) {
      senderAccount.lockedUntil = new Date(Date.now() + 15 * 60000).toISOString();
      saveDatabase(db);
      return {
        success: false,
        error: 'Too many incorrect PIN attempts. Your account is temporarily locked for 15 minutes for security.',
      };
    }
    const remaining = 3 - senderAccount.failedPinAttempts;
    saveDatabase(db);
    return {
      success: false,
      error: `Invalid 6-digit transaction PIN. ${remaining} attempt(s) remaining before security lockout.`,
    };
  }

  // Reset PIN attempts upon successful PIN
  senderAccount.failedPinAttempts = 0;
  senderAccount.lockedUntil = null;

  // 5. Check Sufficient Balance
  if (senderAccount.balance < parsedAmount) {
    return {
      success: false,
      error: `Insufficient funds. Your available balance is ₹${senderAccount.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`,
    };
  }

  // 6. Check Daily Limit (₹2,00,000)
  if ((senderAccount.dailySpent || 0) + parsedAmount > (senderAccount.dailyLimit || 200000)) {
    return {
      success: false,
      error: `Daily transfer limit of ₹2,00,000.00 exceeded. Already transferred ₹${(senderAccount.dailySpent || 0).toLocaleString('en-IN')} today.`,
    };
  }

  // 7. Resolve Recipient
  const recipientRes = resolveRecipientUPI(recipientUpiId, senderUserId);
  if (!recipientRes.valid) {
    return { success: false, error: recipientRes.error };
  }
  const recipientAccount = db.accounts.find(a => a.upiId.toLowerCase() === recipientRes.upiId.toLowerCase());
  const recipientUser = db.users.find(u => u.id === recipientAccount.userId);

  // 8. Atomic Debit & Credit Execution
  senderAccount.balance -= parsedAmount;
  senderAccount.dailySpent = (senderAccount.dailySpent || 0) + parsedAmount;
  recipientAccount.balance += parsedAmount;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randHash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const reference = `TXN-${dateStr}-${randHash}`;

  const transactionRecord = {
    id: `txn_${Date.now()}`,
    reference,
    senderAccountId: senderAccount.id,
    receiverAccountId: recipientAccount.id,
    amount: parsedAmount,
    fee: 0,
    status: 'SUCCESS',
    category,
    description: note.trim() || 'P2P UPI Transfer',
    senderBalanceAfter: senderAccount.balance,
    receiverBalanceAfter: recipientAccount.balance,
    createdAt: new Date().toISOString(),
  };

  db.transactions.unshift(transactionRecord);

  // In-App Notifications
  db.notifications.unshift({
    id: `notif_${Date.now()}_1`,
    userId: senderUserId,
    title: 'Money Sent Successfully',
    message: `₹${parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} debited to ${recipientUser.name} (${recipientAccount.upiId}). Ref: ${reference}`,
    type: 'TRANSFER_SENT',
    read: false,
    createdAt: new Date().toISOString(),
  });

  db.notifications.unshift({
    id: `notif_${Date.now()}_2`,
    userId: recipientUser.id,
    title: 'Money Received',
    message: `₹${parsedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} credited from ${senderUser.name} (${senderAccount.upiId}). Ref: ${reference}`,
    type: 'TRANSFER_RECEIVED',
    read: false,
    createdAt: new Date().toISOString(),
  });

  // Central Audit Log
  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    userId: senderUserId,
    action: 'UPI_TRANSFER',
    details: `Transfer of ₹${parsedAmount} from ${senderAccount.upiId} to ${recipientAccount.upiId} [Ref: ${reference}]`,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);

  return {
    success: true,
    reference,
    amount: parsedAmount,
    recipientName: recipientUser.name,
    recipientUpiId: recipientAccount.upiId,
    newBalance: senderAccount.balance,
    transaction: transactionRecord,
  };
}

// Beneficiaries Management
export function addBeneficiaryToAccount({ userId, upiId, nickname }) {
  const db = loadDatabase();
  const resolve = resolveRecipientUPI(upiId, userId);
  if (!resolve.valid) {
    return { success: false, error: resolve.error };
  }

  const existing = db.beneficiaries.find(
    b => b.userId === userId && b.upiId.toLowerCase() === resolve.upiId.toLowerCase()
  );
  if (existing) {
    return { success: false, error: 'This UPI ID is already in your saved beneficiaries.' };
  }

  const newBeneficiary = {
    id: `ben_${Date.now()}`,
    userId,
    name: resolve.name,
    upiId: resolve.upiId,
    accountNumber: resolve.account.accountNumber,
    nickname: nickname ? nickname.trim() : resolve.name,
  };

  db.beneficiaries.unshift(newBeneficiary);
  saveDatabase(db);
  return { success: true, beneficiary: newBeneficiary };
}

// Admin Operations (Admin is NOT a user, separate administrative controls)
export function adminToggleFreeze(accountId) {
  const db = loadDatabase();
  const account = db.accounts.find(a => a.id === accountId);
  if (!account) return { success: false, error: 'Account not found' };

  account.status = account.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
  const targetUser = db.users.find(u => u.id === account.userId);

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    userId: 'usr_admin',
    action: account.status === 'FROZEN' ? 'ACCOUNT_FREEZE' : 'ACCOUNT_UNFREEZE',
    details: `Account ${account.accountNumber} (${targetUser?.name}) status changed to ${account.status}`,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return { success: true, status: account.status };
}

export function adminUnlockPINLockout(accountId) {
  const db = loadDatabase();
  const account = db.accounts.find(a => a.id === accountId);
  if (!account) return { success: false, error: 'Account not found' };

  account.failedPinAttempts = 0;
  account.lockedUntil = null;
  const targetUser = db.users.find(u => u.id === account.userId);

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    userId: 'usr_admin',
    action: 'PIN_LOCK_CLEARED',
    details: `Security PIN lockout cleared for account ${account.accountNumber} (${targetUser?.name})`,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return { success: true };
}

export function adminAdjustBalance({ accountId, amount, type, reason }) {
  const db = loadDatabase();
  const account = db.accounts.find(a => a.id === accountId);
  if (!account) return { success: false, error: 'Account not found' };

  const parsed = parseFloat(amount);
  if (isNaN(parsed) || parsed <= 0) {
    return { success: false, error: 'Invalid adjustment amount' };
  }

  if (type === 'DEBIT' && account.balance < parsed) {
    return { success: false, error: 'Cannot debit more than current balance' };
  }

  if (type === 'CREDIT') {
    account.balance += parsed;
  } else {
    account.balance -= parsed;
  }

  const targetUser = db.users.find(u => u.id === account.userId);

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    userId: 'usr_admin',
    action: `ADMIN_BALANCE_${type}`,
    details: `Adjusted balance for ${account.accountNumber} (${targetUser?.name}) by ${type === 'CREDIT' ? '+' : '-'}₹${parsed}. Reason: ${reason}`,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
  return { success: true, newBalance: account.balance };
}

// Statement Export Helpers (Questions 46 & 47)
export function downloadCSVStatement(user, account, transactions) {
  const userTxns = transactions.filter(
    t => t.senderAccountId === account.id || t.receiverAccountId === account.id
  );

  const rows = userTxns.map(t => {
    const isDebit = t.senderAccountId === account.id;
    return {
      'Transaction Date': new Date(t.createdAt).toLocaleString('en-IN'),
      'Reference Number': t.reference,
      'Type': isDebit ? 'DEBIT' : 'CREDIT',
      'Category': t.category,
      'Description': t.description,
      'Amount (INR)': t.amount.toFixed(2),
      'Fee (INR)': (t.fee || 0).toFixed(2),
      'Balance After (INR)': (isDebit ? t.senderBalanceAfter : t.receiverBalanceAfter).toFixed(2),
      'Status': t.status,
    };
  });

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Statement_${account.accountNumber}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadPDFStatement(user, account, transactions) {
  const userTxns = transactions.filter(
    t => t.senderAccountId === account.id || t.receiverAccountId === account.id
  );

  const doc = new jsPDF();

  // Bank Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BANKITIS', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253);
  doc.text('Account Statement', 14, 26);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 32);

  // Customer Account Summary Box
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT SUMMARY', 14, 48);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Account Holder: ${user.name}`, 14, 55);
  doc.text(`Account Number: ${account.accountNumber}`, 14, 61);
  doc.text(`Registered UPI: ${account.upiId}`, 14, 67);
  doc.text(`Current Available Balance: INR ${account.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 14, 73);

  // Table of Transactions
  const tableData = userTxns.map(t => {
    const isDebit = t.senderAccountId === account.id;
    return [
      new Date(t.createdAt).toLocaleDateString('en-IN'),
      t.reference,
      t.description,
      t.category,
      isDebit ? `-₹${t.amount.toFixed(2)}` : `+₹${t.amount.toFixed(2)}`,
      `₹${(isDebit ? t.senderBalanceAfter : t.receiverBalanceAfter).toFixed(2)}`,
      t.status,
    ];
  });

  autoTable(doc, {
    startY: 80,
    head: [['Date', 'Reference ID', 'Description', 'Category', 'Amount', 'Balance', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [14, 116, 144] }, // cyan-700
    styles: { fontSize: 8 },
  });

  doc.save(`Statement_${account.accountNumber}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

