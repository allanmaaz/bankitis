'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, LogOut, ShieldCheck, User as UserIcon, CheckCheck, ShieldAlert } from 'lucide-react';
import { logoutAction, markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions';
import { formatDate } from '@/lib/utils';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date | string;
}

interface NavbarProps {
  user: {
    fullName: string;
    email: string;
    role?: string;
    account: {
      accountNumber: string;
      upiId: string;
    };
  };
  notifications: NotificationItem[];
}

export function Navbar({ user, notifications }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(
    notifications.filter((n) => !n.isRead).length
  );
  const [items, setItems] = useState(notifications);

  const handleMarkAllRead = async () => {
    await markAllNotificationsReadAction();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleMarkItemRead = async (id: string) => {
    await markNotificationReadAction(id);
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-sm text-white font-bold text-lg">
            T9
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                Team-9 Digital Bank
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">UPI ID: {user.account.upiId}</p>
          </div>
        </div>

        {/* Right Nav */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {user.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold flex items-center space-x-1.5 transition-colors border border-purple-300 shadow-sm"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
              <span>Admin Console</span>
            </Link>
          )}

          {/* Notifications Popover */}
          <div className="relative">
            <button
              type="button"
              aria-label="View notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                      <p className="text-xs text-slate-500">
                        {unreadCount} unread alert{unreadCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-xs text-sky-600 hover:text-sky-800 font-medium flex items-center"
                      >
                        <CheckCheck className="w-3.5 h-3.5 mr-1" />
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {items.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => !item.isRead && handleMarkItemRead(item.id)}
                          className={`p-4 transition-colors cursor-pointer ${
                            item.isRead ? 'bg-white' : 'bg-sky-50/50 hover:bg-sky-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                item.type === 'CREDIT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.type === 'DEBIT'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              {item.title}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                            {item.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User info */}
          <div className="hidden sm:flex items-center space-x-2 text-right">
            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-semibold text-xs border border-slate-200">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user.fullName}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">
                {user.email}
              </p>
            </div>
          </div>

          {/* Logout */}
          <form
            action={async () => {
              await logoutAction();
            }}
          >
            <button
              type="submit"
              title="Sign out"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

