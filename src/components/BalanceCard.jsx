import React, { useState } from 'react';
import { Send, Users, Contact, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';

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
    <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-6">
      {/* Top bar with account number and status badges */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Account:</span>
          <span className="font-mono text-slate-200">
            {showFullAccount ? account?.accountNumber : `•••• ${account?.accountNumber?.slice(-4)}`}
          </span>
          <button
            onClick={() => setShowFullAccount(!showFullAccount)}
            className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            {showFullAccount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div>
          {isFrozen ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-300">
              Frozen
            </span>
          ) : isLocked ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300">
              PIN Locked
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
              Active
            </span>
          )}
        </div>
      </div>

      {/* Balance Display */}
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
          Available Balance
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          ₹{formattedBalance}
        </div>
      </div>

      {/* UPI and Daily Limit */}
      <div className="grid grid-cols-2 gap-3 bg-slate-800/60 p-3.5 rounded-2xl text-xs">
        <div>
          <div className="text-slate-400">UPI ID</div>
          <div className="font-mono font-medium text-slate-200 mt-0.5">{account?.upiId}</div>
        </div>
        <div>
          <div className="text-slate-400">Daily Limit Left</div>
          <div className="font-medium text-slate-200 mt-0.5">
            ₹{Math.max(0, (account?.dailyLimit || 200000) - (account?.dailySpent || 0)).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <button
          onClick={onOpenSendMoney}
          disabled={isFrozen || isLocked}
          className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-200 disabled:opacity-50 text-slate-900 font-semibold text-xs transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>

        <button
          onClick={onOpenBeneficiaries}
          className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all cursor-pointer"
        >
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Saved</span>
        </button>

        <button
          onClick={onOpenDirectory}
          className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-all cursor-pointer"
        >
          <Contact className="w-3.5 h-3.5 text-slate-400" />
          <span>Directory</span>
        </button>
      </div>
    </div>
  );
}
