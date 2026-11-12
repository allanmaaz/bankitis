import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Wallet,
  Activity,
  Lock,
  Unlock,
  Sliders,
  DollarSign,
  AlertTriangle,
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
        `Successfully ${adjustType === 'CREDIT' ? 'credited' : 'debited'} ₹${adjustAmount} to account ${selectedAccount.accountNumber}.`
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Central Bank Administrator Portal
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Root Clearance
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Administrative Control System • Zero Customer Association
            </p>
          </div>
        </div>

        <button
          onClick={onExitAdmin}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Customer Portal</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
              <span>Total Customer Deposits</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{totalLiquidity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500">Across {customerAccounts.length} active customer accounts</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
              <span>24h Transfer Volume</span>
              <Activity className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ₹{totalVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500">{transactions.length} total ledger records</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
              <span>Frozen Accounts</span>
              <Lock className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-400">{frozenCount}</div>
            <div className="text-[11px] text-slate-500">Blocked from sending funds</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
              <span>Security PIN Lockouts</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{lockedCount}</div>
            <div className="text-[11px] text-slate-500">Exceeded 3 PIN attempts</div>
          </div>
        </div>

        {/* Customer Accounts Management Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Customer Accounts Ledger ({customerAccounts.length})</span>
              </h2>
              <p className="text-xs text-slate-400">
                Real-time compliance status, liquidity adjustments, and security lockout controls
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Account No & UPI</th>
                  <th className="py-3 px-3">Available Balance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">PIN Security</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customerAccounts.map((acc) => {
                  const user = allUsers.find((u) => u.id === acc.userId);
                  const isLocked = acc.lockedUntil && new Date(acc.lockedUntil) > new Date();

                  return (
                    <tr key={acc.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-white">{user?.name}</div>
                        <div className="text-[10px] text-slate-500">{user?.email}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-mono text-slate-300 font-bold">{acc.accountNumber}</div>
                        <div className="text-[11px] font-mono text-sky-400">{acc.upiId}</div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-emerald-400 text-sm">
                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-3.5 px-3">
                        {acc.status === 'FROZEN' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            FROZEN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        {isLocked ? (
                          <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Locked (3 fails)</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Normal ({acc.failedPinAttempts || 0}/3)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex items-center space-x-2">
                          {isLocked && (
                            <button
                              onClick={() => handleUnlockPin(acc.id)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                              title="Clear 3-attempt PIN lockout"
                            >
                              Unlock PIN
                            </button>
                          )}

                          <button
                            onClick={() => handleFreezeToggle(acc.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                              acc.status === 'FROZEN'
                                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/30'
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
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Adjust Balance
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

        {/* Global Central Transaction Ledger */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Global Interbank Transaction Ledger</span>
            </h2>
            <span className="text-xs text-slate-500">{transactions.length} transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 font-mono">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(t.createdAt).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-sky-400 font-bold">{t.reference}</td>
                    <td className="py-2 px-3 text-slate-300">{t.category}</td>
                    <td className="py-2 px-3 text-slate-300">{t.description}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">
                      ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Central Audit Stream */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Administrative Compliance & Audit Stream</span>
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-purple-500/20 text-purple-300">
                    {log.action}
                  </span>
                  <div className="text-slate-300 text-xs mt-1">{log.details}</div>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  {new Date(log.createdAt).toLocaleTimeString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {showAdjustModal && selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm">Administrative Balance Adjustment</h3>
                <p className="text-[11px] text-slate-400">
                  Account: {selectedAccount.accountNumber} ({selectedAccount.upiId})
                </p>
              </div>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('CREDIT')}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
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
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
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
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Adjustment Amount (₹)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Mandatory Audit Reason
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disputed charge reversal"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {adjustError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{adjustError}</span>
                </div>
              )}

              {adjustSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{adjustSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Execute Adjustment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
