import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BalanceCard from './components/BalanceCard';
import SendMoneyModal from './components/SendMoneyModal';
import BeneficiariesModal from './components/BeneficiariesModal';
import DirectoryModal from './components/DirectoryModal';
import DatabaseSettingsModal from './components/DatabaseSettingsModal';
import TransactionHistory from './components/TransactionHistory';
import SpendingAnalytics from './components/SpendingAnalytics';
import AuditLogView from './components/AuditLogView';
import AuthTabs from './components/AuthTabs';
import AdminLoginForm from './components/AdminLoginForm';
import AdminClient from './components/AdminClient';
import { loadDatabase, syncDatabaseWithSupabase } from './lib/bankingEngine';
import { getSupabaseCredentials } from './lib/supabaseClient';
import { Building2, Database } from 'lucide-react';

export default function App() {
  const [db, setDb] = useState(() => loadDatabase());
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('customer');

  // Modals
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isBeneficiariesOpen, setIsBeneficiariesOpen] = useState(false);
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [prefillUpi, setPrefillUpi] = useState('');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const { isConfigured: isCloudDb } = getSupabaseCredentials();

  const refreshDb = () => {
    setDb(loadDatabase());
  };

  useEffect(() => {
    if (window.location.pathname.includes('/admin') || window.location.search.includes('admin')) {
      setView('admin');
    }

    // Try initial sync with cloud Supabase
    syncDatabaseWithSupabase().then((synced) => {
      if (synced) setDb(synced);
    });
  }, []);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm sm:max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-3 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bankitis</h1>
            <p className="text-xs text-slate-500 mt-1">Online Banking & UPI Transfer</p>
          </div>

          <div className="w-full">
            <AuthTabs
              onAuthSuccess={(user) => {
                setCurrentUser(user);
                refreshDb();
              }}
              onNavigateAdmin={() => setView('admin')}
            />
          </div>
        </div>

        <DatabaseSettingsModal
          isOpen={isDbModalOpen}
          onClose={() => setIsDbModalOpen(false)}
          onConnected={(synced) => {
            if (synced) setDb(synced);
            else refreshDb();
          }}
        />
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
        onOpenDbSettings={() => setIsDbModalOpen(true)}
        isCloudDb={isCloudDb}
      />

      {/* Notifications Drawer */}
      {showNotifDropdown && (
        <div className="fixed top-16 right-4 sm:right-8 z-40 max-w-sm w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-4 space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="font-semibold text-xs text-slate-800">
              Notifications
            </span>
            <button
              onClick={() => setShowNotifDropdown(false)}
              className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {userNotifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No notifications</div>
            ) : (
              userNotifications.map((n) => (
                <div key={n.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                  <div className="font-medium text-slate-900">{n.title}</div>
                  <div className="text-slate-600 text-[11px]">{n.message}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString('en-IN')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {currentUser.name}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {currentAccount?.upiId}
            </p>
          </div>
          <button
            onClick={() => {
              setPrefillUpi('');
              setIsSendOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all cursor-pointer"
          >
            + Transfer
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

      <DatabaseSettingsModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onConnected={(synced) => {
          if (synced) setDb(synced);
          else refreshDb();
        }}
      />
    </div>
  );
}
