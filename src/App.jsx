import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BalanceCard from './components/BalanceCard';
import SendMoneyModal from './components/SendMoneyModal';
import BeneficiariesModal from './components/BeneficiariesModal';
import DirectoryModal from './components/DirectoryModal';
import TransactionHistory from './components/TransactionHistory';
import SpendingAnalytics from './components/SpendingAnalytics';
import AuditLogView from './components/AuditLogView';
import AuthTabs from './components/AuthTabs';
import AdminLoginForm from './components/AdminLoginForm';
import AdminClient from './components/AdminClient';
import { loadDatabase } from './lib/bankingEngine';
import { Shield, Zap, CheckCircle2, Lock } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState(() => loadDatabase());
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('customer'); // 'customer' or 'admin'

  // Modals
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isBeneficiariesOpen, setIsBeneficiariesOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [prefillUpi, setPrefillUpi] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  // Sync DB
  const refreshDb = () => {
    setDb(loadDatabase());
  };

  useEffect(() => {
    // Check if URL has ?admin or hash #admin
    if (window.location.pathname.includes('/admin') || window.location.search.includes('admin')) {
      setView('admin');
    }
  }, []);

  // Current customer account
  const currentAccount = currentUser
    ? db.accounts.find((a) => a.userId === currentUser.id)
    : null;

  const userBeneficiaries = currentUser
    ? db.beneficiaries.filter((b) => b.userId === currentUser.id)
    : [];

  const userNotifications = currentUser
    ? db.notifications.filter((n) => n.userId === currentUser.id)
    : [];

  const unreadNotifs = userNotifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    setCurrentUser(null);
    setView('customer');
  };

  // ADMIN VIEW
  if (view === 'admin') {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return (
        <AdminLoginForm
          onAdminLoginSuccess={(adminUser) => {
            setCurrentUser(adminUser);
            refreshDb();
          }}
          onBackToPortal={() => setView('customer')}
        />
      );
    }

    return (
      <AdminClient
        currentUser={currentUser}
        allAccounts={db.accounts}
        allUsers={db.users}
        transactions={db.transactions}
        auditLogs={db.auditLogs}
        onRefresh={refreshDb}
        onExitAdmin={() => setView('customer')}
      />
    );
  }

  // CUSTOMER VIEW (UNAUTHENTICATED)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar
          currentUser={null}
          onNavigateAdmin={() => setView('admin')}
        />

        <main className="max-w-6xl mx-auto px-4 py-12 sm:py-16 w-full">
          {/* Header Title */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Team-9 Banking Management System • Coursework Edition (Pure React)</span>
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
            {/* Left Specs Card */}
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
                      ACID transactional guarantees with strict balance assertions and atomic debit/credit.
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
                      6-digit UPI PIN with automatic 15-minute lockout after 3 failed attempts.
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Exports & Analytics:</span>{' '}
                      Bank-branded PDF statement generation (<code className="font-mono text-slate-800">jsPDF</code>),
                      CSV exports, and cash-flow charts.
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidential Credentials Notice */}
              <div className="p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confidential Access System</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Credentials for customers and administrator accounts are secured and maintained in the official{' '}
                  <strong className="text-white">CREDENTIALS.pdf</strong> document. Login credentials and transaction PINs are never exposed in the public web interface.
                </p>
              </div>
            </div>

            {/* Right Auth Forms */}
            <div className="lg:col-span-6">
              <AuthTabs
                onAuthSuccess={(user) => {
                  setCurrentUser(user);
                  refreshDb();
                }}
                onNavigateAdmin={() => setView('admin')}
              />
            </div>
          </div>
        </main>

        <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto px-4 w-full gap-2">
          <span>Team-9 Banking Management System • Pure React Edition</span>
          <button
            onClick={() => setView('admin')}
            className="text-purple-700 hover:text-purple-900 font-bold flex items-center space-x-1 hover:underline cursor-pointer"
          >
            <span>Bank Administrator Portal →</span>
          </button>
        </footer>
      </div>
    );
  }

  // CUSTOMER DASHBOARD (AUTHENTICATED)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigateAdmin={() => setView('admin')}
        onOpenNotifications={() => setShowNotifDropdown(!showNotifDropdown)}
        unreadCount={unreadNotifs}
      />

      {/* Notifications Drawer */}
      {showNotifDropdown && (
        <div className="fixed top-16 right-4 sm:right-8 z-40 max-w-sm w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
              In-App Notification Center
            </span>
            <button
              onClick={() => setShowNotifDropdown(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Close
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {userNotifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No new notifications</div>
            ) : (
              userNotifications.map((n) => (
                <div key={n.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{n.title}</div>
                  <div className="text-slate-600 text-[11px] leading-relaxed">{n.message}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Registered UPI VPA: <span className="font-mono text-sky-600 font-bold">{currentAccount?.upiId}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setPrefillUpi('');
                setIsSendOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              + Quick Transfer
            </button>
          </div>
        </div>

        {/* Primary Banking Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <BalanceCard
              account={currentAccount}
              user={currentUser}
              onOpenSendMoney={() => {
                setPrefillUpi('');
                setIsSendOpen(true);
              }}
              onOpenBeneficiaries={() => setIsBeneficiariesOpen(true)}
              onOpenDirectory={() => setIsDirectoryOpen(true)}
            />

            <SpendingAnalytics
              transactions={db.transactions}
              currentAccount={currentAccount}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <TransactionHistory
              transactions={db.transactions}
              currentAccount={currentAccount}
              currentUser={currentUser}
              allAccounts={db.accounts}
              allUsers={db.users}
            />

            <AuditLogView auditLogs={db.auditLogs} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <SendMoneyModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        currentUser={currentUser}
        currentAccount={currentAccount}
        beneficiaries={userBeneficiaries}
        prefillUpi={prefillUpi}
        onTransferSuccess={() => {
          refreshDb();
        }}
      />

      <BeneficiariesModal
        isOpen={isBeneficiariesOpen}
        onClose={() => setIsBeneficiariesOpen(false)}
        currentUser={currentUser}
        beneficiaries={userBeneficiaries}
        onRefresh={refreshDb}
        onSelectBeneficiary={(upi) => {
          setPrefillUpi(upi);
          setIsSendOpen(true);
        }}
      />

      <DirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        allAccounts={db.accounts}
        allUsers={db.users}
        currentUser={currentUser}
        onSelectUser={(upi) => {
          setPrefillUpi(upi);
          setIsSendOpen(true);
        }}
      />

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 max-w-7xl mx-auto px-4 w-full">
        Team-9 Banking Management System • Pure React Edition
      </footer>
    </div>
  );
}
