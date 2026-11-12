import React, { useState } from 'react';
import {
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
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

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
      name: targetUser ? targetUser.name : 'Account',
      upi: targetAccount ? targetAccount.upiId : 'UPI',
    };
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
      {/* Top Header & Export Statement Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base text-slate-900">Transactions</h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => downloadPDFStatement(currentUser, currentAccount, accountTransactions)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>

          <button
            onClick={() => downloadCSVStatement(currentUser, currentAccount, accountTransactions)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
          >
            <option value="ALL">All Types</option>
            <option value="DEBIT">Sent</option>
            <option value="CREDIT">Received</option>
          </select>
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
          >
            <option value="ALL">All Categories</option>
            <option value="GENERAL">General</option>
            <option value="FOOD">Food</option>
            <option value="SHOPPING">Shopping</option>
            <option value="BILLS">Bills</option>
            <option value="SERVICES">Services</option>
            <option value="ENTERTAINMENT">Entertainment</option>
          </select>
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map((t) => {
            const isDebit = t.senderAccountId === currentAccount?.id;
            const counterparty = getCounterpartyInfo(t);

            return (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isDebit ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {isDebit ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="font-medium text-slate-900 text-xs">
                      {isDebit ? counterparty.name : counterparty.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {new Date(t.createdAt).toLocaleDateString('en-IN')} • {t.reference}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-bold ${
                      isDebit ? 'text-slate-900' : 'text-emerald-600'
                    }`}
                  >
                    {isDebit ? '-' : '+'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t.status}
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
