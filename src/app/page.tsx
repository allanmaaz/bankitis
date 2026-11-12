import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserBeneficiaries } from '@/lib/beneficiaries';
import { getDailyTransferUtilized } from '@/lib/banking';
import { getFilteredTransactions, getSpendingAnalytics } from '@/lib/transactions';
import { getUserNotifications } from '@/lib/notifications';
import { DashboardClient } from '@/components/DashboardClient';
import { AuthTabs } from '@/components/AuthTabs';
import { Shield, Zap, Lock, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user && user.role === 'ADMIN') {
    redirect('/admin');
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16 w-full">
          {/* Top Hero Heading */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Team-9 Banking Management System • Coursework MVP</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Enterprise Online Banking & Instant UPI Transfers
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              Atomic funds transfer engine with row-level locks, recipient name verification, 
              6-digit UPI PIN protection, formal PDF statements, and live spending analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Features & Specs Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
                <h2 className="font-bold text-lg text-slate-900 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-sky-600" />
                  Key Specifications Implemented
                </h2>

                <div className="space-y-3.5 text-xs text-slate-600">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Zero Double-Spending:</span>{' '}
                      PostgreSQL ACID transaction with strict row-level locking (<code className="text-slate-800 font-mono">SELECT FOR UPDATE</code>) via Prisma.
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Recipient Verification:</span>{' '}
                      Automatic UPI ID resolution that previews verified customer names before transfers proceed.
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Tiered Limits:</span>{' '}
                      ₹1 to ₹1,00,000 per transaction limit, ₹2,00,000 daily ceiling, and ₹0 transaction fees.
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Dedicated Transaction Security:</span>{' '}
                      6-digit UPI PIN (bcrypt hashed) with automatic 15-minute lockout after 3 failed attempts.
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Exports & Analytics:</span>{' '}
                      Bank-branded PDF statement generation (<code className="font-mono text-slate-800">jsPDF</code>), CSV exports, and cash-flow charts.
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Access Notice */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confidential Access System</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Credentials for customers and administrator accounts are secured and maintained in the official 
                  <strong className="text-white"> Banking Credentials Specification PDF</strong>. 
                  Login credentials and transaction PINs are never exposed in the public interface.
                </p>
              </div>
            </div>

            {/* Authentication Form Card */}
            <div className="lg:col-span-6">
              <AuthTabs />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto px-4 w-full gap-2">
          <span>Team-9 Banking Management System • Next.js • PostgreSQL • Prisma</span>
          <Link
            href="/admin"
            className="text-purple-700 hover:text-purple-900 font-bold flex items-center space-x-1 hover:underline"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Bank Administrator Portal &rarr;</span>
          </Link>
        </footer>
      </div>
    );
  }

  // User is authenticated: Fetch all dashboard data
  const [beneficiaries, txnResult, dailyUtilized, analytics, notifications, auditLogs] =
    await Promise.all([
      getUserBeneficiaries(user.id),
      getFilteredTransactions({ accountId: user.account.id, limit: 50 }),
      getDailyTransferUtilized(user.account.id),
      getSpendingAnalytics(user.account.id),
      getUserNotifications(user.id),
      prisma.auditLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

  return (
    <DashboardClient
      user={user}
      beneficiaries={beneficiaries}
      transactions={txnResult.transactions}
      dailyUtilized={dailyUtilized}
      analytics={analytics}
      notifications={notifications}
      auditLogs={auditLogs}
    />
  );
}
