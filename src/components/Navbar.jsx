import React from 'react';
import { Building2, Shield, LogOut, Bell, User } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, onNavigateAdmin, onOpenNotifications, unreadCount = 0 }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">Bankitis</span>
        </div>

        <div className="flex items-center space-x-3">
          {currentUser && currentUser.role === 'ADMIN' && (
            <button
              onClick={onNavigateAdmin}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-slate-600" />
              <span>Admin</span>
            </button>
          )}

          {currentUser && (
            <>
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>

              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200 text-xs">
                <span className="font-medium text-slate-800">{currentUser.name}</span>
              </div>

              <button
                onClick={onLogout}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
