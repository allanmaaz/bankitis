import { getCurrentUser } from '@/lib/auth';
import {
  getAdminMetrics,
  getAllCustomerAccounts,
  getSystemWideTransactions,
  getSystemWideAuditLogs,
} from '@/lib/admin';
import { AdminClient } from '@/components/AdminClient';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions';

export default async function AdminPage() {
  const user = await getCurrentUser();

  // 1. Not signed in: Show dedicated Admin Login form
  if (!user) {
    return <AdminLoginForm />;
  }

  // 2. Signed in as customer (non-admin): Show Access Denied with switcher
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold">Admin Privileges Required</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            You are currently signed in as customer <span className="font-semibold text-white">{user.email}</span>. 
            The Central Bank Admin Console is restricted to System Administrators.
          </p>
          <div className="pt-2 flex items-center justify-center space-x-3">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Customer Portal</span>
            </Link>

            <form
              action={async () => {
                'use server';
                await logoutAction();
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Switch Account</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 3. User is verified ADMIN: Load full console
  const [metrics, accounts, transactions, auditLogs] = await Promise.all([
    getAdminMetrics(),
    getAllCustomerAccounts(),
    getSystemWideTransactions(),
    getSystemWideAuditLogs(),
  ]);

  return (
    <AdminClient
      adminUser={user}
      metrics={metrics}
      accounts={accounts}
      transactions={transactions}
      auditLogs={auditLogs}
    />
  );
}
