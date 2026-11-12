import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Wallet,
  Activity,
  Lock,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import {
  adminToggleFreeze,
  adminUnlockPINLockout,
  adminAdjustBalance,
} from '../lib/bankingEngine';

export default function AdminClient({
  currentUser,
  allAccounts = [],
  allUsers = [],
  transactions = [],
  auditLogs = [],
  onRefresh,
  onExitAdmin,
}) {
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('CREDIT');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustError, setAdjustError] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState('');

  // Strictly filter customer accounts only (Admin is NOT a customer)
  const customerAccounts = allAccounts.filter((acc) => {
    const user = allUsers.find((u) => u.id === acc.userId);
    return user && user.role === 'CUSTOMER';
  });

  const totalLiquidity = customerAccounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const frozenCount = customerAccounts.filter((a) => a.status === 'FROZEN').length;
  const lockedCount = customerAccounts.filter(
    (a) => a.lockedUntil && new Date(a.lockedUntil) > new Date()
  ).length;

  const handleFreezeToggle = (accId) => {
    adminToggleFreeze(accId);
    if (onRefresh) onRefresh();
  };

  const handleUnlockPin = (accId) => {
    adminUnlockPINLockout(accId);
    if (onRefresh) onRefresh();
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    setAdjustError('');
    setAdjustSuccess('');

    if (!selectedAccount) return;

    const res = adminAdjustBalance({
      accountId: selectedAccount.id,
      amount: adjustAmount,
      type: adjustType,
      reason: adjustReason,
    });

    if (res.success) {
      setAdjustSuccess(
        `Successfully ${adjustType === 'CREDIT' ? 'credited' : 'debited'} ₹${adjustAmount}.`
      );
      setAdjustAmount('');
      setAdjustReason('');
      if (onRefresh) onRefresh();
      setTimeout(() => {
        setShowAdjustModal(false);
        setAdjustSuccess('');
        setSelectedAccount(null);
      }, 1500);
    } else {
      setAdjustError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-6">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Bankitis Admin
            </h1>
            <p className="text-xs text-slate-400">
              Operations & Management
            </p>
          </div>
        </div>

        <button
          onClick={onExitAdmin}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 font-medium">Customer Deposits</div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              ₹{totalLiquidity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 font-medium">Transfer Volume</div>
            <div className="text-xl sm:text-2xl font-bold text-white">
              ₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 font-medium">Frozen Accounts</div>
            <div className="text-xl sm:text-2xl font-bold text-rose-400">{frozenCount}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
            <div className="text-xs text-slate-400 font-medium">PIN Lockouts</div>
            <div className="text-xl sm:text-2xl font-bold text-amber-400">{lockedCount}</div>
          </div>
        </div>

        {/* Customer Accounts Management Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Customer Accounts ({customerAccounts.length})</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[10px] uppercase font-medium text-slate-500">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Account & UPI</th>
                  <th className="py-2.5 px-3">Balance</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Security</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {customerAccounts.map((acc) => {
                  const user = allUsers.find((u) => u.id === acc.userId);
                  const isLocked = acc.lockedUntil && new Date(acc.lockedUntil) > new Date();

                  return (
                    <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-medium text-white">{user?.name}</div>
                        <div className="text-[10px] text-slate-500">{user?.email}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-300">{acc.accountNumber}</div>
                        <div className="text-[10px] font-mono text-slate-400">{acc.upiId}</div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-emerald-400 text-xs">
                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3">
                        {acc.status === 'FROZEN' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300">
                            FROZEN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {isLocked ? (
                          <span className="text-amber-400 font-medium text-[11px]">Locked</span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Normal</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          {isLocked && (
                            <button
                              onClick={() => handleUnlockPin(acc.id)}
                              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Unlock PIN
                            </button>
                          )}

                          <button
                            onClick={() => handleFreezeToggle(acc.id)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                              acc.status === 'FROZEN'
                                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300'
                            }`}
                          >
                            {acc.status === 'FROZEN' ? 'Unfreeze' : 'Freeze'}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedAccount(acc);
                              setShowAdjustModal(true);
                              setAdjustError('');
                              setAdjustSuccess('');
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            Adjust
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Transaction Ledger */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Transaction Ledger</span>
            </h2>
            <span className="text-xs text-slate-500">{transactions.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[10px] uppercase font-medium text-slate-500">
                <tr>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Ref</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30 font-mono">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/20">
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-slate-200">{t.reference}</td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">
                      ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {showAdjustModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-semibold text-white text-sm">Adjust Balance</h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('CREDIT')}
                    className={`py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      adjustType === 'CREDIT'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    + Credit
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('DEBIT')}
                    className={`py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      adjustType === 'DEBIT'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    - Debit
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-semibold focus:outline-none focus:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="Reason"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-slate-700"
                />
              </div>

              {adjustError && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {adjustError}
                </div>
              )}

              {adjustSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {adjustSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-medium text-xs transition-all cursor-pointer"
              >
                Execute
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
