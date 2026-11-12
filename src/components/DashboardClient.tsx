'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { BalanceCard } from './BalanceCard';
import { SendMoneyModal } from './SendMoneyModal';
import { BeneficiariesModal } from './BeneficiariesModal';
import { DirectoryModal } from './DirectoryModal';
import { TransactionHistory } from './TransactionHistory';
import { SpendingAnalytics } from './SpendingAnalytics';
import { AuditLogView } from './AuditLogView';

interface DashboardClientProps {
  user: any;
  beneficiaries: any[];
  transactions: any[];
  dailyUtilized: number;
  analytics: any;
  notifications: any[];
  auditLogs: any[];
}

export function DashboardClient({
  user,
  beneficiaries,
  transactions,
  dailyUtilized,
  analytics,
  notifications,
  auditLogs,
}: DashboardClientProps) {
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isBeneficiaryModalOpen, setIsBeneficiaryModalOpen] = useState(false);
  const [isDirectoryModalOpen, setIsDirectoryModalOpen] = useState(false);
  const [targetRecipientUpi, setTargetRecipientUpi] = useState<string>('');

  const handleOpenSendWithUpi = (upi: string) => {
    setTargetRecipientUpi(upi);
    setIsSendModalOpen(true);
  };

  const handleScrollToStatements = () => {
    const el = document.getElementById('transactions-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Navigation Bar */}
      <Navbar user={user} notifications={notifications} />

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Welcome Greeting Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user.fullName.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Team-9 Digital Banking System • UPI Connected: <span className="font-mono text-slate-700 font-bold">{user.account.upiId}</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Core Banking Online
            </span>
          </div>
        </div>

        {/* 1. Executive Balance Card & Quick Actions */}
        <BalanceCard
          account={user.account}
          dailyUtilized={dailyUtilized}
          onOpenSendModal={() => {
            setTargetRecipientUpi('');
            setIsSendModalOpen(true);
          }}
          onOpenBeneficiaryModal={() => setIsBeneficiaryModalOpen(true)}
          onOpenDirectoryModal={() => setIsDirectoryModalOpen(true)}
          onScrollToStatements={handleScrollToStatements}
        />

        {/* 2. Spending Analytics & Cashflow Charts */}
        <SpendingAnalytics analytics={analytics} />

        {/* 3. Transaction History & Statements */}
        <TransactionHistory
          currentAccountId={user.account.id}
          initialTransactions={transactions}
        />

        {/* 4. Security & Audit Trail */}
        <AuditLogView logs={auditLogs} />
      </main>

      {/* Modals */}
      <SendMoneyModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        beneficiaries={beneficiaries}
        currentBalance={Number(user.account.balance)}
        dailyUtilized={dailyUtilized}
        initialRecipientUpi={targetRecipientUpi}
      />

      <BeneficiariesModal
        isOpen={isBeneficiaryModalOpen}
        onClose={() => setIsBeneficiaryModalOpen(false)}
        beneficiaries={beneficiaries}
        onSelectPay={handleOpenSendWithUpi}
      />

      <DirectoryModal
        isOpen={isDirectoryModalOpen}
        onClose={() => setIsDirectoryModalOpen(false)}
        onSelectPay={handleOpenSendWithUpi}
      />
    </div>
  );
}

