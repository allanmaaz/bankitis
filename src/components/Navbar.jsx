import React from 'react';
import { Building2, ShieldAlert, LogOut, Bell, User } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, onNavigateAdmin, onOpenNotifications, unreadCount = 0 }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">Team-9 Bank</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                Coursework Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Secure Online Banking & Real-Time UPI Core
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentUser && currentUser.role === 'ADMIN' && (
            <button
              onClick={onNavigateAdmin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs border border-purple-200 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
              <span>Admin Console</span>
            </button>
          )}

          {currentUser && (
            <>
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200 text-xs">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500">{currentUser.email}</div>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
