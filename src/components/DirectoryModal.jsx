import React, { useState } from 'react';
import { X, Search, Send, UserCheck } from 'lucide-react';

export default function DirectoryModal({
  isOpen,
  onClose,
  allAccounts = [],
  allUsers = [],
  currentUser,
  onSelectUser,
}) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  // Filter out current user and Admin (Admin is NOT a customer)
  const directory = allAccounts
    .filter((acc) => {
      const user = allUsers.find((u) => u.id === acc.userId);
      return user && user.role === 'CUSTOMER' && acc.userId !== currentUser.id;
    })
    .map((acc) => {
      const user = allUsers.find((u) => u.id === acc.userId);
      return {
        ...acc,
        name: user.name,
        email: user.email,
      };
    })
    .filter((item) => {
      const q = query.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.upiId.toLowerCase().includes(q) ||
        item.accountNumber.toLowerCase().includes(q)
      );
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Verified Customer Directory</h3>
            <p className="text-[11px] text-slate-500">
              Browse all registered customers eligible for instant transfers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, UPI ID, or account number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {directory.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No matching verified customer accounts found.
              </div>
            ) : (
              directory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{item.name}</div>
                      <div className="text-[11px] text-indigo-600 font-mono mt-0.5">{item.upiId}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        A/C: •••• {item.accountNumber.slice(-4)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectUser) onSelectUser(item.upiId);
                      onClose();
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Pay</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
