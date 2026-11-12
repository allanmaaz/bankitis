'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TransactionStatus, TransactionCategory } from '@prisma/client';

interface TransactionItem {
  id: string;
  referenceNumber: string;
  amount: number | string | { toString(): string };
  fee: number | string | { toString(): string };
  status: TransactionStatus;
  category: TransactionCategory;
  note?: string | null;
  senderAccountId: string;
  receiverAccountId: string;
  senderBalanceAfter: number | string | { toString(): string };
  receiverBalanceAfter: number | string | { toString(): string };
  createdAt: Date | string;
  senderAccount: {
    upiId: string;
    user: { fullName: string; email: string };
  };
  receiverAccount: {
    upiId: string;
    user: { fullName: string; email: string };
  };
}

interface TransactionHistoryProps {
  currentAccountId: string;
  initialTransactions: TransactionItem[];
}

export function TransactionHistory({
  currentAccountId,
  initialTransactions,
}: TransactionHistoryProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS'>('ALL');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Client-side instant filtering on initial set
  const filtered = initialTransactions.filter((t) => {
    const isDebit = t.senderAccountId === currentAccountId;

    // Type filter
    if (typeFilter === 'DEBIT' && !isDebit) return false;
    if (typeFilter === 'CREDIT' && isDebit) return false;

    // Status filter
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;

    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const tDate = new Date(t.createdAt);
      if (dateFilter === 'TODAY') {
        if (
          tDate.getDate() !== now.getDate() ||
          tDate.getMonth() !== now.getMonth() ||
          tDate.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      } else if (dateFilter === '7DAYS') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (tDate < sevenDaysAgo) return false;
      } else if (dateFilter === '30DAYS') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (tDate < thirtyDaysAgo) return false;
      }
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const ref = t.referenceNumber.toLowerCase();
      const note = (t.note || '').toLowerCase();
      const sName = t.senderAccount.user.fullName.toLowerCase();
      const rName = t.receiverAccount.user.fullName.toLowerCase();
      const sUpi = t.senderAccount.upiId.toLowerCase();
      const rUpi = t.receiverAccount.upiId.toLowerCase();

      return (
        ref.includes(q) ||
        note.includes(q) ||
        sName.includes(q) ||
        rName.includes(q) ||
        sUpi.includes(q) ||
        rUpi.includes(q)
      );
    }

    return true;
  });

  return (
    <div id="transactions-section" className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Transaction Passbook & History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unlimited transaction history with advanced search & statement exports
          </p>
        </div>

        {/* Statement Exports (Question 47) */}
        <div className="flex items-center space-x-2">
          <a
            href="/api/statement/pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Statement</span>
          </a>

          <a
            href="/api/statement/csv"
            download
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1.5 border border-slate-200"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV Export</span>
          </a>
        </div>
      </div>

      {/* Search & Filter Bar (Question 46) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference, recipient, note, or UPI handle..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
            />
          </div>

          <div className="flex space-x-2">
            {/* Quick Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'DEBIT' | 'CREDIT')}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Types</option>
              <option value="DEBIT">Debits Only (-)</option>
              <option value="CREDIT">Credits Only (+)</option>
            </select>

            {/* Quick Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'ALL' | 'TODAY' | '7DAYS' | '30DAYS')}
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center transition-colors ${
                showAdvanced
                  ? 'border-sky-500 bg-sky-50 text-sky-700'
                  : 'border-slate-300 hover:bg-slate-50 text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Transaction Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="ALL">Any Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Results Count
              </label>
              <p className="py-2 text-slate-700 font-semibold">
                Showing {filtered.length} of {initialTransactions.length} transactions
              </p>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('ALL');
                  setStatusFilter('ALL');
                  setDateFilter('ALL');
                }}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-300 rounded-lg transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Transaction / Party</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Date & Time</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              <th className="py-3.5 px-4 text-right">Balance After</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No transactions match the selected filters.
                </td>
              </tr>
            ) : (
              filtered.map((t) => {
                const isDebit = t.senderAccountId === currentAccountId;
                const counterpartyName = isDebit
                  ? t.receiverAccount.user.fullName
                  : t.senderAccount.user.fullName;
                const counterpartyUpi = isDebit
                  ? t.receiverAccount.upiId
                  : t.senderAccount.upiId;
                const balanceAfter = isDebit ? t.senderBalanceAfter : t.receiverBalanceAfter;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Party & Ref */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            isDebit
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {isDebit ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownLeft className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{counterpartyName}</p>
                          <p className="font-mono text-[11px] text-slate-500">
                            {counterpartyUpi} • <span className="text-slate-400">{t.referenceNumber}</span>
                          </p>
                          {t.note && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">"{t.note}"</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {t.category}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                      {formatDate(t.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-bold text-sm ${
                          isDebit ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isDebit ? '-' : '+'} {formatCurrency(t.amount)}
                      </span>
                    </td>

                    {/* Balance After */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-slate-700">
                      {formatCurrency(balanceAfter)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

