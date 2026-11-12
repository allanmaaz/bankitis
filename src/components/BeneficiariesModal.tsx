'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UserPlus,
  Trash2,
  Send,
  UserCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { addBeneficiaryAction, removeBeneficiaryAction, resolveRecipientAction } from '@/app/actions';

interface Beneficiary {
  id: string;
  beneficiaryUpi: string;
  beneficiaryName: string;
  nickname?: string | null;
}

interface BeneficiariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaries: Beneficiary[];
  onSelectPay: (upi: string) => void;
}

export function BeneficiariesModal({
  isOpen,
  onClose,
  beneficiaries,
  onSelectPay,
}: BeneficiariesModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [upiInput, setUpiInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState('');
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setActiveTab('list');
    setUpiInput('');
    setNicknameInput('');
    setResolvedName(null);
    setVerifyError(null);
    setSaveSuccess(false);
  };

  const handleVerify = async () => {
    const clean = upiInput.trim();
    if (!clean || !clean.includes('@')) {
      setVerifyError('Please enter a valid UPI address (e.g. rahul@bank)');
      setResolvedName(null);
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      const res = await resolveRecipientAction(clean);
      if (res.success && res.recipientName) {
        if (res.isSelf) {
          setVerifyError('You cannot add your own UPI ID as a beneficiary');
          setResolvedName(null);
        } else {
          setResolvedName(res.recipientName);
          setUpiInput(res.upiId || clean);
        }
      } else {
        setVerifyError(res.error || 'User not found in registered accounts');
        setResolvedName(null);
      }
    } catch {
      setVerifyError('Network error while verifying recipient');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedName) return;

    setIsSaving(true);
    setVerifyError(null);

    try {
      const res = await addBeneficiaryAction(upiInput, nicknameInput);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          resetForm();
          setActiveTab('list');
        }, 1200);
      } else {
        setVerifyError(res.error || 'Failed to save beneficiary');
      }
    } catch {
      setVerifyError('Error saving beneficiary');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this beneficiary?')) return;
    await removeBeneficiaryAction(id);
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="beneficiary-modal-title"
      className="p-0 rounded-3xl shadow-2xl bg-white text-slate-900 w-full max-w-lg mx-auto backdrop:bg-slate-950/70 overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <h2 id="beneficiary-modal-title" className="text-lg font-bold text-slate-900">
            Beneficiary Management
          </h2>
          <p className="text-xs text-slate-500">
            Add, verify, and manage your trusted transfer recipients
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 px-6 pt-3">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider mr-6 transition-colors border-b-2 ${
            activeTab === 'list'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Saved Beneficiaries ({beneficiaries.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('add')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
            activeTab === 'add'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          + Add New Beneficiary
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'list' && (
          <div>
            {beneficiaries.length === 0 ? (
              <div className="py-12 text-center">
                <UserPlus className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-800">No beneficiaries added yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Save frequent recipients to transfer money quickly without typing their UPI ID each time.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-500 transition-colors"
                >
                  Add Beneficiary Now
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {beneficiaries.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          {b.nickname || b.beneficiaryName}
                        </span>
                        {b.nickname && (
                          <span className="text-xs text-slate-500 font-normal">
                            ({b.beneficiaryName})
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-xs text-sky-700 mt-0.5">
                        {b.beneficiaryUpi}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onSelectPay(b.beneficiaryUpi);
                        }}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Pay</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Beneficiary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'add' && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label htmlFor="beneficiary-upi-field" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Recipient UPI ID
              </label>
              <div className="flex space-x-2">
                <input
                  id="beneficiary-upi-field"
                  type="text"
                  value={upiInput}
                  onChange={(e) => {
                    setUpiInput(e.target.value);
                    setResolvedName(null);
                    setVerifyError(null);
                  }}
                  placeholder="e.g. rahul@bank"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying || !upiInput.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  {isVerifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Check</span>
                  )}
                </button>
              </div>

              {/* Automatic Verified Name (Question 44) */}
              {resolvedName && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[11px] text-emerald-700 font-medium">Verified Identity</p>
                      <p className="text-sm font-bold text-emerald-900">{resolvedName}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-800 font-semibold text-[10px]">
                    Automatic Verified
                  </span>
                </div>
              )}

              {verifyError && (
                <div className="mt-2 text-xs text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{verifyError}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="beneficiary-nickname-field" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Nickname / Label (Optional)
              </label>
              <input
                id="beneficiary-nickname-field"
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="e.g. Rahul Flatmate"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Beneficiary saved successfully!</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving || !resolvedName}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Beneficiary...</span>
                  </>
                ) : (
                  <span>Save Beneficiary (No PIN Required)</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}

