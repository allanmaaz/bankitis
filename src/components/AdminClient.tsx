'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  CreditCard,
  ArrowRightLeft,
  Lock,
  Unlock,
  DollarSign,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  LogOut,
  ArrowLeft,
  X,
  Loader2,
  KeyRound,
  Eye,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  toggleAccountStatusAction,
  adjustAccountBalanceAction,
  unlockCustomerPinAction,
  fetchCustomerHistoryAction,
  logoutAction,
} from '@/app/actions';

interface AdminClientProps {
  adminUser: {
    fullName: string;
    email: string;
    role: string;
  };
  metrics: {
    totalCustomers: number;
    totalAccounts: number;
    activeAccounts: number;
    frozenAccounts: number;
    totalDeposits: number;
    totalTransactionsCount: number;
    totalVolume: number;
    recentAuditsCount: number;
  };
  accounts: any[];
  transactions: any[];
  auditLogs: any[];
}

export function AdminClient({
  adminUser,
  metrics,
  accounts,
  transactions,
  auditLogs,
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'audit'>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Adjustment Modal State
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [adjustAmountStr, setAdjustAmountStr] = useState('');
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustReason, setAdjustReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const adjustDialogRef = useRef<HTMLDialogElement>(null);

  // Customer Inspector State
  const [inspectingAccount, setInspectingAccount] = useState<any | null>(null);
  const [inspectingTxns, setInspectingTxns] = useState<any[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const inspectDialogRef = useRef<HTMLDialogElement>(null);

  // PIN Unlock State
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  // Transaction Ledger Filters
  const [txnSearch, setTxnSearch] = useState('');
  const [txnStatusFilter, setTxnStatusFilter] = useState('ALL');

  // Audit Filter
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  const handleOpenAdjust = (account: any) => {
    setSelectedAccount(account);
    setAdjustAmountStr('');
    setAdjustReason('');
    setAdjustMessage(null);
    if (adjustDialogRef.current) {
      adjustDialogRef.current.showModal();
    }
  };

  const handleCloseAdjust = () => {
    if (adjustDialogRef.current) {
      adjustDialogRef.current.close();
    }
    setSelectedAccount(null);
  };

  const handleExecuteAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    const amt = parseFloat(adjustAmountStr);
    if (isNaN(amt) || amt <= 0) {
      setAdjustMessage({ text: 'Please enter a valid positive amount', isError: true });
      return;
    }

    const finalAmount = adjustType === 'CREDIT' ? amt : -amt;

    setIsAdjusting(true);
    setAdjustMessage(null);

    try {
      const res = await adjustAccountBalanceAction(
        selectedAccount.id,
        finalAmount,
        adjustReason || 'Admin adjustment'
      );
      if (res.success) {
        setAdjustMessage({ text: 'Balance adjusted successfully!', isError: false });
        setTimeout(() => {
          handleCloseAdjust();
        }, 1200);
      } else {
        setAdjustMessage({ text: res.error || 'Failed to adjust balance', isError: true });
      }
    } catch {
      setAdjustMessage({ text: 'Error connecting to server', isError: true });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleToggleFreeze = async (account: any) => {
    const isCurrentlyFrozen = account.status === 'FROZEN';
    const newStatus = isCurrentlyFrozen ? 'ACTIVE' : 'FROZEN';
    const actionText = isCurrentlyFrozen ? 'unfreeze' : 'freeze';

    if (
      !confirm(
        `Are you sure you want to ${actionText} account ${account.accountNumber} (${account.user.fullName})?`
      )
    ) {
      return;
    }

    await toggleAccountStatusAction(account.id, newStatus);
  };

  const handleUnlockPin = async (account: any) => {
    if (!confirm(`Clear PIN lockout and reset attempts for ${account.user.fullName}?`)) return;
    setUnlockingId(account.id);
    try {
      await unlockCustomerPinAction(account.id);
    } finally {
      setUnlockingId(null);
    }
  };

  const handleInspectCustomer = async (account: any) => {
    setInspectingAccount(account);
    setLoadingTxns(true);
    if (inspectDialogRef.current) {
      inspectDialogRef.current.showModal();
    }
    try {
      const data = await fetchCustomerHistoryAction(account.id);
      setInspectingTxns(data);
    } catch {
      setInspectingTxns([]);
    } finally {
      setLoadingTxns(false);
    }
  };

  const handleCloseInspect = () => {
    if (inspectDialogRef.current) {
      inspectDialogRef.current.close();
    }
    setInspectingAccount(null);
    setInspectingTxns([]);
  };

  // Filtered accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (statusFilter !== 'ALL' && acc.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = acc.user.fullName.toLowerCase();
      const email = acc.user.email.toLowerCase();
      const num = acc.accountNumber.toLowerCase();
      const upi = acc.upiId.toLowerCase();
      return name.includes(q) || email.includes(q) || num.includes(q) || upi.includes(q);
    }
    return true;
  });

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    if (txnStatusFilter !== 'ALL' && t.status !== txnStatusFilter) return false;
    if (txnSearch.trim()) {
      const q = txnSearch.toLowerCase();
      const ref = t.referenceNumber.toLowerCase();
      const sender = t.senderAccount.user.fullName.toLowerCase();
      const receiver = t.receiverAccount.user.fullName.toLowerCase();
      const note = (t.note || '').toLowerCase();
      return ref.includes(q) || sender.includes(q) || receiver.includes(q) || note.includes(q);
    }
    return true;
  });

  // Filtered Audits
  const filteredAudits = auditLogs.filter((log) => {
    if (auditActionFilter !== 'ALL' && log.action !== auditActionFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/20 text-white font-black text-lg">
              ADM
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white text-base tracking-tight">
                  Team-9 Bank • Executive Admin Console
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Root Admin
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Operator: {adminUser.fullName} ({adminUser.email})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors flex items-center space-x-1.5 border border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </Link>

            <form
              action={async () => {
                await logoutAction();
              }}
            >
              <button
                type="submit"
                title="Sign out of Admin"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Customer Deposits</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">
              {formatCurrency(metrics.totalDeposits)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Active liquidity across all customers
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Registered Accounts</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">{metrics.totalAccounts}</p>
            <div className="flex items-center space-x-2 text-[11px] mt-1">
              <span className="text-emerald-400 font-semibold">{metrics.activeAccounts} Active</span>
              <span className="text-slate-500">•</span>
              <span className="text-rose-400 font-semibold">{metrics.frozenAccounts} Frozen</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Transactions</span>
              <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">
              {metrics.totalTransactionsCount}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Total Volume:{' '}
              <span className="text-white font-bold">{formatCurrency(metrics.totalVolume)}</span>
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Security Audits</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">{metrics.recentAuditsCount}</p>
            <p className="text-[11px] text-emerald-400 mt-1">System Security: Operational</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 space-x-6 text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'accounts'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Accounts ({accounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'transactions'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>System Ledger ({transactions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-3 border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'audit'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: ACCOUNTS MANAGEMENT */}
        {activeTab === 'accounts' && (
          <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
            {/* Search and filter bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by customer name, email, account number, or UPI ID..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="FROZEN">Frozen Only</option>
              </select>
            </div>

            {/* Accounts Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-700">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Customer Info</th>
                    <th className="py-3.5 px-4">Account Number</th>
                    <th className="py-3.5 px-4">UPI Address</th>
                    <th className="py-3.5 px-4 text-right">Balance</th>
                    <th className="py-3.5 px-4 text-center">Status / Security</th>
                    <th className="py-3.5 px-4 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        No customer accounts found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => {
                      const isFrozen = acc.status === 'FROZEN';
                      const isAdmin = acc.user.role === 'ADMIN';
                      const isPinLocked =
                        (acc.failedPinCount && acc.failedPinCount > 0) ||
                        (acc.pinLockedUntil && new Date(acc.pinLockedUntil) > new Date());

                      return (
                        <tr key={acc.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-white text-xs">
                                  {acc.user.fullName}
                                </span>
                                {isAdmin && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400">{acc.user.email}</p>
                              <p className="text-[10px] text-slate-500">{acc.user.phoneNumber}</p>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-slate-300">
                            {acc.accountNumber}
                          </td>

                          <td className="py-3.5 px-4 font-mono text-sky-400 font-medium">
                            {acc.upiId}
                          </td>

                          <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                            {formatCurrency(acc.balance)}
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center space-y-1">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isFrozen
                                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                }`}
                              >
                                {acc.status}
                              </span>

                              {isPinLocked && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  PIN Lockout
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Inspect details */}
                              <button
                                type="button"
                                onClick={() => handleInspectCustomer(acc)}
                                title="Inspect statement & activity"
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Adjust balance */}
                              <button
                                type="button"
                                onClick={() => handleOpenAdjust(acc)}
                                className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors flex items-center space-x-1"
                              >
                                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Adjust</span>
                              </button>

                              {/* Unlock PIN if locked */}
                              {isPinLocked && (
                                <button
                                  type="button"
                                  onClick={() => handleUnlockPin(acc)}
                                  disabled={unlockingId === acc.id}
                                  title="Reset failed PIN attempts"
                                  className="px-2 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-semibold transition-colors flex items-center space-x-1"
                                >
                                  <KeyRound className="w-3.5 h-3.5" />
                                  <span>Unlock PIN</span>
                                </button>
                              )}

                              {/* Freeze/Unfreeze toggle */}
                              {!isAdmin && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleFreeze(acc)}
                                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 ${
                                    isFrozen
                                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                      : 'bg-rose-600/80 hover:bg-rose-600 text-white'
                                  }`}
                                >
                                  {isFrozen ? (
                                    <>
                                      <Unlock className="w-3.5 h-3.5" />
                                      <span>Unfreeze</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>Freeze</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SYSTEM-WIDE TRANSACTION LEDGER */}
        {activeTab === 'transactions' && (
          <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <h3 className="font-bold text-base text-white">Full System Transaction Ledger</h3>
                <p className="text-xs text-slate-400">
                  Showing {filteredTransactions.length} of {transactions.length} total transfers
                </p>
              </div>

              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={txnSearch}
                    onChange={(e) => setTxnSearch(e.target.value)}
                    placeholder="Search ref, sender, receiver..."
                    className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <select
                  value={txnStatusFilter}
                  onChange={(e) => setTxnStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-700">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Reference No.</th>
                    <th className="py-3.5 px-4">Sender</th>
                    <th className="py-3.5 px-4">Receiver</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/60">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No transactions found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-sky-400">
                          {t.referenceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">
                            {t.senderAccount.user.fullName}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {t.senderAccount.upiId}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-white">
                            {t.receiverAccount.user.fullName}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {t.receiverAccount.upiId}
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-semibold">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white text-sm">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatDate(t.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700/60 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-white">Central System Audit Logs</h3>
                <p className="text-xs text-slate-400">Immutable security and operations trail</p>
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Actions</option>
                <option value="USER_LOGIN">User Logins</option>
                <option value="TRANSFER_EXECUTED">Transfers</option>
                <option value="FAILED_PIN_ATTEMPT">Failed PINs</option>
                <option value="ADMIN_ACCOUNT_STATUS_CHANGE">Status Changes</option>
                <option value="ADMIN_BALANCE_ADJUSTMENT">Adjustments</option>
                <option value="ADMIN_PIN_UNLOCK">PIN Unlocks</option>
              </select>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {filteredAudits.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  No audit logs match criteria.
                </div>
              ) : (
                filteredAudits.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-start justify-between text-xs"
                  >
                    <div className="flex items-start space-x-3">
                      <Clock className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-white">{log.action}</span>
                          {log.user && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              • User: {log.user.fullName} ({log.user.email})
                            </span>
                          )}
                          {log.ipAddress && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              IP: {log.ipAddress}
                            </span>
                          )}
                        </div>
                        {log.details && (
                          <p className="text-[11px] text-slate-300 mt-1 font-mono">
                            {typeof log.details === 'object'
                              ? JSON.stringify(log.details)
                              : String(log.details)}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-3">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ADJUST BALANCE MODAL */}
      <dialog
        ref={adjustDialogRef}
        aria-labelledby="adjust-balance-title"
        className="p-0 rounded-3xl shadow-2xl bg-slate-900 text-slate-100 w-full max-w-md mx-auto border border-slate-700 backdrop:bg-slate-950/80 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 id="adjust-balance-title" className="text-base font-bold text-white">
              Adjust Customer Balance
            </h2>
            <p className="text-xs text-slate-400">
              Administrative credit or debit correction with audit trail
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseAdjust}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedAccount && (
          <form onSubmit={handleExecuteAdjust} className="p-6 space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="text-slate-400">Target Account:</p>
              <p className="font-bold text-white text-sm">{selectedAccount.user.fullName}</p>
              <p className="font-mono text-sky-400">{selectedAccount.upiId}</p>
              <p className="text-slate-300 font-semibold pt-1">
                Current Balance: {formatCurrency(selectedAccount.balance)}
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Adjustment Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('CREDIT')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    adjustType === 'CREDIT'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  + Credit Funds
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('DEBIT')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    adjustType === 'DEBIT'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  - Debit Funds
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={adjustAmountStr}
                onChange={(e) => setAdjustAmountStr(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Adjustment Reason / Note
              </label>
              <input
                type="text"
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Regulatory adjustment, bonus deposit"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
              />
            </div>

            {adjustMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  adjustMessage.isError
                    ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                    : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                }`}
              >
                {adjustMessage.text}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isAdjusting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                {isAdjusting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Submit Balance Adjustment</span>
                )}
              </button>
            </div>
          </form>
        )}
      </dialog>

      {/* CUSTOMER INSPECTOR MODAL */}
      <dialog
        ref={inspectDialogRef}
        aria-labelledby="inspect-customer-title"
        className="p-0 rounded-3xl shadow-2xl bg-slate-900 text-slate-100 w-full max-w-2xl mx-auto border border-slate-700 backdrop:bg-slate-950/80 overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 id="inspect-customer-title" className="text-base font-bold text-white">
              Customer Account Activity &amp; Passbook
            </h2>
            <p className="text-xs text-slate-400">
              Audit view of customer transactions and balance history
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseInspect}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {inspectingAccount && (
          <div className="p-6 space-y-5">
            {/* Customer Summary Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
              <div>
                <p className="text-slate-500">Customer:</p>
                <p className="font-bold text-white">{inspectingAccount.user.fullName}</p>
                <p className="text-[11px] text-slate-400">{inspectingAccount.user.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Account No:</p>
                <p className="font-mono text-white">{inspectingAccount.accountNumber}</p>
                <p className="font-mono text-sky-400 text-[11px]">{inspectingAccount.upiId}</p>
              </div>
              <div>
                <p className="text-slate-500">Available Balance:</p>
                <p className="font-bold text-emerald-400 text-sm">
                  {formatCurrency(inspectingAccount.balance)}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Account Status:</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    inspectingAccount.status === 'FROZEN'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  {inspectingAccount.status}
                </span>
              </div>
            </div>

            {/* Transactions Table for this customer */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recent Transaction History
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                {loadingTxns ? (
                  <div className="py-8 flex justify-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : inspectingTxns.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    No transactions recorded for this account.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Ref No.</th>
                        <th className="py-2.5 px-3">Party</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {inspectingTxns.map((t) => {
                        const isDebit = t.senderAccountId === inspectingAccount.id;
                        const party = isDebit
                          ? `To: ${t.receiverAccount.user.fullName}`
                          : `From: ${t.senderAccount.user.fullName}`;

                        return (
                          <tr key={t.id} className="hover:bg-slate-800/40">
                            <td className="py-2 px-3 text-slate-400 text-[11px]">
                              {formatDate(t.createdAt)}
                            </td>
                            <td className="py-2 px-3 font-mono text-sky-400 text-[11px]">
                              {t.referenceNumber}
                            </td>
                            <td className="py-2 px-3 text-slate-200">{party}</td>
                            <td
                              className={`py-2 px-3 text-right font-bold ${
                                isDebit ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {isDebit ? '-' : '+'}
                              {formatCurrency(t.amount)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="text-[10px] font-semibold text-emerald-400">
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
