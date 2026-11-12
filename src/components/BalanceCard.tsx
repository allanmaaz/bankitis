'use client';

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  Send,
  UserPlus,
  Users,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency, maskAccountNumber } from '@/lib/utils';

interface BalanceCardProps {
  account: {
    id: string;
    accountNumber: string;
    upiId: string;
    balance: number | string | { toString(): string };
  };
  dailyUtilized: number;
  onOpenSendModal: () => void;
  onOpenBeneficiaryModal: () => void;
  onOpenDirectoryModal: () => void;
  onScrollToStatements: () => void;
}

export function BalanceCard({
  account,
  dailyUtilized,
  onOpenSendModal,
  onOpenBeneficiaryModal,
  onOpenDirectoryModal,
  onScrollToStatements,
}: BalanceCardProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);

  const numericBalance =
    typeof account.balance === 'number'
      ? account.balance
      : parseFloat(account.balance.toString());

  const DAILY_MAX = 200000;
  const utilizedPercent = Math.min(100, Math.round((dailyUtilized / DAILY_MAX) * 100));
  const remainingDaily = Math.max(0, DAILY_MAX - dailyUtilized);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(account.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAcc = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Account Card */}
      <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10 border border-slate-700/50">
        {/* Decorative background glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                Available Bank Balance
              </span>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {showBalance ? formatCurrency(numericBalance) : '••••••••'}
                </span>
                <button
                  type="button"
                  aria-label={showBalance ? "Hide balance" : "Show balance"}
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Account
              </span>
            </div>
          </div>

          {/* Account Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700/60">
            <div>
              <p className="text-xs text-slate-400">Account Number</p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="font-mono text-sm font-medium text-slate-200">
                  {maskAccountNumber(account.accountNumber)}
                </span>
                <button
                  type="button"
                  onClick={handleCopyAcc}
                  title="Copy Account Number"
                  className="text-slate-400 hover:text-white"
                >
                  {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400">Virtual Payment Address (UPI)</p>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="font-mono text-sm font-semibold text-sky-300">
                  {account.upiId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  title="Copy UPI ID"
                  className="text-slate-400 hover:text-white"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={onOpenSendModal}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/25 active:scale-95 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send Money</span>
            </button>

            <button
              type="button"
              onClick={onOpenBeneficiaryModal}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Beneficiaries</span>
            </button>

            <button
              type="button"
              onClick={onOpenDirectoryModal}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>User Directory</span>
            </button>

            <button
              type="button"
              onClick={onScrollToStatements}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/10 active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Statements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily Limits & Insights Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
              Daily Limit Utilization
            </h3>
            <span className="text-xs font-semibold text-slate-500">₹2,00,000 / day</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                <span>Transferred Today:</span>
                <span className="font-bold text-slate-900">{formatCurrency(dailyUtilized)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    utilizedPercent > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${utilizedPercent}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining limit today:</span>
                <span className="font-bold text-emerald-700">{formatCurrency(remainingDaily)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Per transaction limit:</span>
                <span className="font-bold text-slate-800">₹1 to ₹1,00,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction fee:</span>
                <span className="font-bold text-emerald-600">₹0.00 (Zero Fee)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Security Protocol:</span>
          <span className="text-slate-700 font-semibold">6-Digit UPI PIN Protected</span>
        </div>
      </div>
    </div>
  );
}

