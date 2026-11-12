'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Loader2,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { resolveRecipientAction, transferMoneyAction } from '@/app/actions';
import { formatCurrency } from '@/lib/utils';
import { TransactionCategory } from '@prisma/client';

interface Beneficiary {
  id: string;
  beneficiaryUpi: string;
  beneficiaryName: string;
  nickname?: string | null;
}

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  beneficiaries: Beneficiary[];
  currentBalance: number;
  dailyUtilized: number;
  initialRecipientUpi?: string;
  onTransferSuccess?: () => void;
}

export function SendMoneyModal({
  isOpen,
  onClose,
  beneficiaries,
  currentBalance,
  dailyUtilized,
  initialRecipientUpi = '',
  onTransferSuccess,
}: SendMoneyModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Steps: 'recipient' -> 'amount' -> 'pin' -> 'success'
  const [step, setStep] = useState<'recipient' | 'amount' | 'pin' | 'success'>('recipient');

  // Form states
  const [recipientUpi, setRecipientUpi] = useState(initialRecipientUpi);
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<TransactionCategory>(TransactionCategory.TRANSFER);
  const [note, setNote] = useState('');

  const [upiPin, setUpiPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Success result
  const [successReceipt, setSuccessReceipt] = useState<{
    referenceNumber: string;
    amount: number;
    recipientName: string;
    recipientUpi: string;
    senderBalanceAfter: number;
    createdAt?: Date;
    note?: string | null;
  } | null>(null);

  // Open / Close control with native <dialog>
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      if (initialRecipientUpi) {
        setRecipientUpi(initialRecipientUpi);
        handleResolve(initialRecipientUpi);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
      resetForm();
    }
  }, [isOpen, initialRecipientUpi]);

  const resetForm = () => {
    setStep('recipient');
    setRecipientUpi('');
    setResolvedName(null);
    setResolveError(null);
    setAmountStr('');
    setCategory(TransactionCategory.TRANSFER);
    setNote('');
    setUpiPin('');
    setTransferError(null);
    setSuccessReceipt(null);
  };

  const handleResolve = async (upiToResolve: string) => {
    const cleanUpi = upiToResolve.trim();
    if (!cleanUpi || !cleanUpi.includes('@')) {
      setResolveError('Please enter a valid UPI ID (e.g. priya@bank)');
      setResolvedName(null);
      return;
    }

    setIsResolving(true);
    setResolveError(null);

    try {
      const res = await resolveRecipientAction(cleanUpi);
      if (res.success && res.recipientName) {
        if (res.isSelf) {
          setResolveError('Self-transfer is not allowed');
          setResolvedName(null);
        } else {
          setResolvedName(res.recipientName);
          setRecipientUpi(res.upiId || cleanUpi);
        }
      } else {
        setResolveError(res.error || 'Recipient not found in registered accounts');
        setResolvedName(null);
      }
    } catch {
      setResolveError('Failed to resolve UPI ID. Please check connection.');
      setResolvedName(null);
    } finally {
      setIsResolving(false);
    }
  };

  const handleSelectBeneficiary = (b: Beneficiary) => {
    setRecipientUpi(b.beneficiaryUpi);
    setResolvedName(b.beneficiaryName);
    setResolveError(null);
    setStep('amount');
  };

  const handleProceedToAmount = () => {
    if (!resolvedName) {
      setResolveError('Recipient must be verified before proceeding');
      return;
    }
    setStep('amount');
  };

  const handleProceedToPin = () => {
    const amt = parseFloat(amountStr);
    if (isNaN(amt) || amt < 1) {
      setTransferError('Minimum transfer amount is ₹1.00');
      return;
    }
    if (amt > 100000) {
      setTransferError('Maximum allowed transfer per transaction is ₹1,00,000.00');
      return;
    }
    if (amt > currentBalance) {
      setTransferError(`Insufficient account balance (Available: ${formatCurrency(currentBalance)})`);
      return;
    }
    if (dailyUtilized + amt > 200000) {
      const rem = Math.max(0, 200000 - dailyUtilized);
      setTransferError(`Daily limit exceeded. Remaining limit for today is ${formatCurrency(rem)}`);
      return;
    }

    setTransferError(null);
    setStep('pin');
  };

  const handleExecuteTransfer = async () => {
    if (upiPin.length !== 6) {
      setTransferError('Please enter all 6 digits of your UPI PIN');
      return;
    }

    setIsSubmitting(true);
    setTransferError(null);

    const idempotencyKey = `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    try {
      const res = await transferMoneyAction({
        recipientUpi,
        amount: parseFloat(amountStr),
        upiPin,
        category,
        note,
        idempotencyKey,
      });

      if (res.success && res.referenceNumber) {
        setSuccessReceipt({
          referenceNumber: res.referenceNumber,
          amount: res.amount || parseFloat(amountStr),
          recipientName: res.recipientName || resolvedName || '',
          recipientUpi: res.recipientUpi || recipientUpi,
          senderBalanceAfter: res.senderBalanceAfter || 0,
          createdAt: res.createdAt,
          note: res.note,
        });
        setStep('success');
        if (onTransferSuccess) onTransferSuccess();
      } else {
        setTransferError(res.error || 'Transaction failed. Please check your PIN.');
      }
    } catch {
      setTransferError('Network or system error occurred while processing transfer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="send-money-title"
      className="p-0 rounded-3xl shadow-2xl bg-white text-slate-900 w-full max-w-lg mx-auto backdrop:bg-slate-950/70 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div>
          <h2 id="send-money-title" className="text-lg font-bold text-slate-900">
            {step === 'success' ? 'Transfer Receipt' : 'Send Money (UPI)'}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 'recipient' && 'Select or enter recipient UPI ID'}
            {step === 'amount' && 'Specify transfer amount & category'}
            {step === 'pin' && 'Authorize payment with 6-digit PIN'}
            {step === 'success' && 'Transaction completed successfully'}
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

      <div className="p-6">
        {/* STEP 1: RECIPIENT */}
        {step === 'recipient' && (
          <div className="space-y-5">
            <div>
              <label htmlFor="recipient-upi-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Enter Recipient UPI ID
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    id="recipient-upi-input"
                    type="text"
                    value={recipientUpi}
                    onChange={(e) => {
                      setRecipientUpi(e.target.value);
                      setResolvedName(null);
                      setResolveError(null);
                    }}
                    placeholder="e.g. priya@bank"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleResolve(recipientUpi)}
                  disabled={isResolving || !recipientUpi.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  {isResolving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Verify</span>
                    </>
                  )}
                </button>
              </div>

              {/* Verified Name Banner (Question 42) */}
              {resolvedName && (
                <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-[11px] text-emerald-700 font-medium">Verified Banking Name</p>
                      <p className="text-sm font-bold text-emerald-900">{resolvedName}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-800 font-semibold text-[10px]">
                    Valid Recipient
                  </span>
                </div>
              )}

              {resolveError && (
                <div className="mt-2 text-xs text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{resolveError}</span>
                </div>
              )}
            </div>

            {/* Saved Beneficiaries Quick Select */}
            {beneficiaries.length > 0 && (
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Or Pick from Saved Beneficiaries
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {beneficiaries.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBeneficiary(b)}
                      className="p-3 text-left rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all flex items-center justify-between group"
                    >
                      <div className="truncate">
                        <p className="font-semibold text-xs text-slate-900 truncate">
                          {b.nickname || b.beneficiaryName}
                        </p>
                        <p className="font-mono text-[11px] text-slate-500 truncate">
                          {b.beneficiaryUpi}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={!resolvedName}
              onClick={handleProceedToAmount}
              className="w-full mt-4 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Continue to Amount</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: AMOUNT & CATEGORY */}
        {step === 'amount' && (
          <div className="space-y-4">
            {/* Recipient summary pill */}
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Sending to:</p>
                <p className="text-sm font-bold text-slate-900">{resolvedName}</p>
                <p className="text-xs text-slate-600 font-mono">{recipientUpi}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('recipient')}
                className="text-xs text-sky-600 font-semibold hover:underline"
              >
                Change
              </button>
            </div>

            <div>
              <label htmlFor="transfer-amount-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Transfer Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                  ₹
                </span>
                <input
                  id="transfer-amount-input"
                  type="number"
                  min="1"
                  max="100000"
                  step="any"
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    setTransferError(null);
                  }}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 text-2xl font-bold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex space-x-2 mt-2">
                {[500, 1000, 2000, 5000].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setAmountStr(chip.toString());
                      setTransferError(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    +₹{chip.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label htmlFor="transfer-category-select" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Spending Category
              </label>
              <select
                id="transfer-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value={TransactionCategory.TRANSFER}>P2P Transfer</option>
                <option value={TransactionCategory.RENT}>Rent</option>
                <option value={TransactionCategory.GROCERIES}>Groceries</option>
                <option value={TransactionCategory.UTILITIES}>Bills & Utilities</option>
                <option value={TransactionCategory.DINING}>Food & Dining</option>
                <option value={TransactionCategory.ENTERTAINMENT}>Entertainment</option>
                <option value={TransactionCategory.OTHER}>Other</option>
              </select>
            </div>

            {/* Note */}
            <div>
              <label htmlFor="transfer-note-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Add a Note (Optional)
              </label>
              <input
                id="transfer-note-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What is this transfer for?"
                maxLength={60}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {transferError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('recipient')}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleProceedToPin}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
              >
                <span>Authorize & Enter PIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: 6-DIGIT UPI PIN */}
        {step === 'pin' && (
          <div className="space-y-5 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">Enter 6-Digit UPI PIN</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirming transfer of{' '}
                <span className="font-bold text-slate-900">
                  {formatCurrency(parseFloat(amountStr))}
                </span>{' '}
                to <span className="font-bold text-slate-900">{resolvedName}</span>
              </p>
            </div>

            {/* PIN keypad/input */}
            <div className="max-w-xs mx-auto">
              <input
                id="transfer-upi-pin-input"
                aria-label="6-digit UPI PIN"
                type="password"
                maxLength={6}
                value={upiPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setUpiPin(val);
                  setTransferError(null);
                }}
                autoFocus
                placeholder="••••••"
                className="w-full text-center tracking-[1em] text-3xl font-mono py-3 rounded-2xl border-2 border-slate-300 focus:border-sky-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-2">
                Enter your secret 6-digit transaction PIN
              </p>
            </div>

            {transferError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-center space-x-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('amount')}
                disabled={isSubmitting}
                className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={isSubmitting || upiPin.length !== 6}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Transfer...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Pay {formatCurrency(parseFloat(amountStr))}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS RECEIPT */}
        {step === 'success' && successReceipt && (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-extrabold text-2xl text-slate-900">Payment Successful</h3>
              <p className="text-3xl font-black text-slate-900 mt-2">
                {formatCurrency(successReceipt.amount)}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Ref: {successReceipt.referenceNumber}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Paid To:</span>
                <span className="font-bold text-slate-900">{successReceipt.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UPI Address:</span>
                <span className="font-mono text-slate-700">{successReceipt.recipientUpi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Updated Account Balance:</span>
                <span className="font-bold text-emerald-700">
                  {formatCurrency(successReceipt.senderBalanceAfter)}
                </span>
              </div>
              {successReceipt.note && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Note:</span>
                  <span className="text-slate-700 italic">{successReceipt.note}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}

