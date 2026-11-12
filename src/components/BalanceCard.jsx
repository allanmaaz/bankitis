import React, { useState } from 'react';
import { Send, Users, Contact, Eye, EyeOff, ShieldCheck, ArrowUpRight, AlertTriangle } from 'lucide-react';

export default function BalanceCard({
  account,
  user,
  onOpenSendMoney,
  onOpenBeneficiaries,
  onOpenDirectory,
}) {
  const [showFullAccount, setShowFullAccount] = useState(false);

  const formattedBalance = account?.balance?.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) || '0.00';

  const isFrozen = account?.status === 'FROZEN';
  const isLocked = account?.lockedUntil && new Date(account.lockedUntil) > new Date();

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Top bar with account number and status badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/60 pb-4">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Account:</span>
            <span className="font-mono font-bold text-slate-200">
              {showFullAccount ? account?.accountNumber : `•••• •••• ${account?.accountNumber?.slice(-4)}`}
            </span>
            <button
              onClick={() => setShowFullAccount(!showFullAccount)}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title={showFullAccount ? 'Hide account' : 'Show account'}
            >
              {showFullAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {isFrozen ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span>Account Frozen</span>
              </span>
            ) : isLocked ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                <span>PIN Lockout</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 mr-1" />
                <span>Active Account</span>
              </span>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold">
            Total Available Balance
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              ₹{formattedBalance}
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> 100% Liquid
            </span>
          </div>
        </div>

        {/* User UPI Handle and daily limit tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Your UPI VPA</div>
            <div className="font-mono font-bold text-sky-400 text-sm mt-0.5">{account?.upiId}</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Daily Transfer Limit Remaining</div>
            <div className="font-bold text-slate-200 mt-0.5">
              ₹{Math.max(0, (account?.dailyLimit || 200000) - (account?.dailySpent || 0)).toLocaleString('en-IN')} / ₹2,00,000
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={onOpenSendMoney}
            disabled={isFrozen || isLocked}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-600/30 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span>Send Money</span>
          </button>

          <button
            onClick={onOpenBeneficiaries}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>Beneficiaries</span>
          </button>

          <button
            onClick={onOpenDirectory}
            className="flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Contact className="w-4 h-4 text-indigo-400" />
            <span>Directory</span>
          </button>
        </div>
      </div>
    </div>
  );
}
