import React, { useState } from 'react';
import {
  Download,
  Filter,
  FileSpreadsheet,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { downloadPDFStatement, downloadCSVStatement } from '../lib/bankingEngine';

export default function TransactionHistory({
  transactions = [],
  currentAccount,
  currentUser,
  allAccounts = [],
  allUsers = [],
}) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, DEBIT, CREDIT
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Filter transactions for this user's account
  const accountTransactions = transactions.filter(
    (t) => t.senderAccountId === currentAccount?.id || t.receiverAccountId === currentAccount?.id
  );

  const filteredTransactions = accountTransactions.filter((t) => {
    const isDebit = t.senderAccountId === currentAccount?.id;

    if (filterType === 'DEBIT' && !isDebit) return false;
    if (filterType === 'CREDIT' && isDebit) return false;
    if (filterCategory !== 'ALL' && t.category !== filterCategory) return false;
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchRef = t.reference.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchAmount = t.amount.toString().includes(q);
      return matchRef || matchDesc || matchAmount;
    }
    return true;
  });

  const getCounterpartyInfo = (t) => {
    const isDebit = t.senderAccountId === currentAccount?.id;
    const targetAccId = isDebit ? t.receiverAccountId : t.senderAccountId;
    const targetAccount = allAccounts.find((a) => a.id === targetAccId);
    const targetUser = allUsers.find((u) => u.id === targetAccount?.userId);

    return {
      name: targetUser ? targetUser.name : 'External Account',
      upi: targetAccount ? targetAccount.upiId : 'UPI Transfer',
    };
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
      {/* Top Header & Export Statement Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-lg text-slate-900">Transaction History & Statements</h2>
          <p className="text-xs text-slate-500">
            Real-time ledger entries • Unlimited search history
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => downloadPDFStatement(currentUser, currentAccount, accountTransactions)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            title="Download Bank-Branded Statement (PDF)"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>PDF Statement</span>
          </button>

          <button
            onClick={() => downloadCSVStatement(currentUser, currentAccount, accountTransactions)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            title="Export for Spreadsheet (CSV)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ref, note, amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Types (Debit & Credit)</option>
            <option value="DEBIT">Money Sent (Debit)</option>
            <option value="CREDIT">Money Received (Credit)</option>
          </select>
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="FOOD">Food & Dining</option>
            <option value="SHOPPING">Shopping</option>
            <option value="BILLS">Bills & Utilities</option>
            <option value="SERVICES">Services</option>
            <option value="ENTERTAINMENT">Entertainment</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Completed (Success)</option>
            <option value="FAILED">Failed / Rejected</option>
          </select>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No transactions found matching your filter criteria.
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const isDebit = t.senderAccountId === currentAccount?.id;
            const counterparty = getCounterpartyInfo(t);

            return (
              <div
                key={t.id}
                className="p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isDebit
                        ? 'bg-rose-50 text-rose-600 border border-rose-100'
                        : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}
                  >
                    {isDebit ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {isDebit ? `To: ${counterparty.name}` : `From: ${counterparty.name}`}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-mono text-slate-600">
                        {counterparty.upi}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{t.description || 'P2P Transfer'}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">{t.reference}</span>
                      <span>•</span>
                      <span>{new Date(t.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div
                    className={`text-sm sm:text-base font-extrabold ${
                      isDebit ? 'text-slate-900' : 'text-emerald-600'
                    }`}
                  >
                    {isDebit ? '-' : '+'}₹
                    {t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Bal: ₹
                    {(isDebit ? t.senderBalanceAfter : t.receiverBalanceAfter).toLocaleString(
                      'en-IN',
                      { minimumFractionDigits: 2 }
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
