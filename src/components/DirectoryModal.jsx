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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-sm">Customer Directory</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search directory..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {directory.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No users found
              </div>
            ) : (
              directory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900 text-xs">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{item.upiId}</div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectUser) onSelectUser(item.upiId);
                      onClose();
                    }}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all cursor-pointer"
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
