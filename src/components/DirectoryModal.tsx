'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Send, UserPlus, Users, Loader2 } from 'lucide-react';
import { getDirectoryAction, addBeneficiaryAction } from '@/app/actions';

interface DirectoryUser {
  id: string;
  fullName: string;
  email: string;
  accounts: {
    upiId: string;
    accountNumber: string;
  }[];
}

interface DirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPay: (upi: string) => void;
}

export function DirectoryModal({ isOpen, onClose, onSelectPay }: DirectoryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      loadUsers('');
    } else {
      if (dialog.open) dialog.close();
      setSearchQuery('');
      setActionMessage(null);
    }
  }, [isOpen]);

  const loadUsers = async (query: string) => {
    setIsLoading(true);
    try {
      const data = await getDirectoryAction(query);
      setUsers(data as DirectoryUser[]);
    } catch {
      console.error('Failed to load directory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers(searchQuery);
  };

  const handleAddBeneficiary = async (upi: string) => {
    try {
      const res = await addBeneficiaryAction(upi);
      if (res.success) {
        setActionMessage(`Added ${upi} to saved beneficiaries!`);
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        setActionMessage(res.error || 'Failed to add');
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {
      setActionMessage('Error adding beneficiary');
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="directory-modal-title"
      className="p-0 rounded-3xl shadow-2xl bg-white text-slate-900 w-full max-w-lg mx-auto backdrop:bg-slate-950/70 overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <h2 id="directory-modal-title" className="text-lg font-bold text-slate-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            Registered Customer Directory
          </h2>
          <p className="text-xs text-slate-500">
            Find and transfer to verified users registered in this bank
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <form onSubmit={handleSearch} className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                loadUsers(e.target.value);
              }}
              placeholder="Search by name or UPI handle..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
            />
          </div>
        </form>

        {actionMessage && (
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 font-medium">
            {actionMessage}
          </div>
        )}

        {/* Directory List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No registered customers match your search.
            </div>
          ) : (
            users.map((u) => {
              const primaryAccount = u.accounts[0];
              if (!primaryAccount) return null;

              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between transition-colors"
                >
                  <div className="truncate">
                    <p className="font-bold text-xs text-slate-900 truncate">{u.fullName}</p>
                    <p className="font-mono text-[11px] text-sky-700 truncate">
                      {primaryAccount.upiId}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <button
                      type="button"
                      onClick={() => handleAddBeneficiary(primaryAccount.upiId)}
                      title="Save as Beneficiary"
                      className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectPay(primaryAccount.upiId);
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Transfer</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </dialog>
  );
}

