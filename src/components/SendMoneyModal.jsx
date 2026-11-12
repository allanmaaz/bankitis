import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { resolveRecipientUPI, executeMoneyTransfer } from '../lib/bankingEngine';

export default function SendMoneyModal({
  isOpen,
  onClose,
  currentUser,
  currentAccount,
  beneficiaries = [],
  onTransferSuccess,
  prefillUpi = '',
}) {
  const [step, setStep] = useState(1); // 1: Input details, 2: Review & PIN, 3: Success Receipt
  const [recipientUpi, setRecipientUpi] = useState(prefillUpi);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [note, setNote] = useState('');
  const [pin, setPin] = useState('');

  const [resolvedRecipient, setResolvedRecipient] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState('');

  const [transferring, setTransferring] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (prefillUpi) {
      setRecipientUpi(prefillUpi);
      handleResolve(prefillUpi);
    }
  }, [prefillUpi]);

  if (!isOpen) return null;

  const handleResolve = (val) => {
    const upi = val || recipientUpi;
    if (!upi) return;
    setResolving(true);
    setResolveError('');
    setResolvedRecipient(null);

    const res = resolveRecipientUPI(upi, currentUser.id);
    setResolving(false);
    if (res.valid) {
      setResolvedRecipient(res);
    } else {
      setResolveError(res.error);
    }
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    if (!resolvedRecipient) {
      handleResolve();
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      setTransferError('Minimum transfer amount is ₹1.00');
      return;
    }
    if (numAmount > 100000) {
      setTransferError('Maximum transfer amount is ₹1,00,000.00');
      return;
    }
    if (numAmount > currentAccount.balance) {
      setTransferError(
        `Insufficient funds. Available balance is ₹${currentAccount.balance.toLocaleString('en-IN')}`
      );
      return;
    }

    setTransferError('');
    setStep(2);
  };

  const handleConfirmTransfer = (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setTransferError('Please enter a valid 6-digit transaction PIN');
      return;
    }

    setTransferring(true);
    setTransferError('');

    const res = executeMoneyTransfer({
      senderUserId: currentUser.id,
      recipientUpiId: resolvedRecipient.upiId,
      amount,
      pin,
      note,
      category,
    });

    setTransferring(false);

    if (res.success) {
      setReceipt(res);
      setStep(3);
      if (onTransferSuccess) onTransferSuccess(res);
    } else {
      setTransferError(res.error);
    }
  };

  const resetModal = () => {
    setStep(1);
    setRecipientUpi('');
    setAmount('');
    setPin('');
    setNote('');
    setResolvedRecipient(null);
    setResolveError('');
    setTransferError('');
    setReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
              UPI
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {step === 1 && 'Instant Money Transfer'}
                {step === 2 && 'Review & Authorize Payment'}
                {step === 3 && 'Payment Completed'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {step === 1 && 'Zero transaction fees • Instant settlement'}
                {step === 2 && 'Verify details before confirmation'}
                {step === 3 && 'Funds transferred securely'}
              </p>
            </div>
          </div>
          <button
            onClick={resetModal}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Details Entry */}
        {step === 1 && (
          <form onSubmit={handleProceedToReview} className="p-6 space-y-4">
            {/* Quick Beneficiary Selector */}
            {beneficiaries.length > 0 && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Saved Beneficiaries
                </label>
                <div className="flex space-x-2 overflow-x-auto pb-1">
                  {beneficiaries.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setRecipientUpi(b.upiId);
                        handleResolve(b.upiId);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-xs text-left shrink-0 transition-all"
                    >
                      <div className="font-bold text-slate-900">{b.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{b.upiId}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recipient UPI ID */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Recipient UPI ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. priya@bank"
                  value={recipientUpi}
                  onChange={(e) => {
                    setRecipientUpi(e.target.value);
                    setResolvedRecipient(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={() => handleResolve()}
                  disabled={resolving || !recipientUpi}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  {resolving ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              {/* Verified Recipient Box */}
              {resolvedRecipient && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-950">{resolvedRecipient.name}</span>
                      <span className="text-[10px] text-emerald-700 ml-2 font-mono">
                        ({resolvedRecipient.upiId})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md">
                    Verified
                  </span>
                </div>
              )}

              {resolveError && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resolveError}</span>
                </div>
              )}
            </div>

            {/* Transfer Amount */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Transfer Amount (₹)
                </label>
                <span className="text-[10px] text-slate-400">
                  Balance: ₹{currentAccount.balance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-lg font-bold text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Limit: ₹1.00 min • ₹1,00,000.00 max per transaction
              </p>
            </div>

            {/* Category & Note */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="GENERAL">General</option>
                  <option value="FOOD">Food & Dining</option>
                  <option value="SHOPPING">Shopping</option>
                  <option value="BILLS">Bills & Utilities</option>
                  <option value="SERVICES">Services</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Remarks / Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dinner split"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {transferError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!resolvedRecipient || !amount}
              className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/20 cursor-pointer"
            >
              <span>Continue to Confirmation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Review & PIN */}
        {step === 2 && (
          <form onSubmit={handleConfirmTransfer} className="p-6 space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Pay To:</span>
                <span className="font-bold text-slate-900">{resolvedRecipient?.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Recipient UPI ID:</span>
                <span className="font-mono text-slate-700">{resolvedRecipient?.upiId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Amount:</span>
                <span className="text-base font-extrabold text-slate-900">
                  ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-slate-200/60 pt-2">
                <span className="text-slate-500">Transaction Fee:</span>
                <span className="font-bold text-emerald-600">₹0.00 (Free)</span>
              </div>
            </div>

            {/* 6-Digit PIN */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                <span>Enter 6-Digit Transaction PIN</span>
              </label>
              <input
                type="password"
                maxLength={6}
                required
                autoFocus
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[1em] text-2xl font-mono py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 text-center mt-1">
                Account locks for 15 minutes after 3 incorrect attempts.
              </p>
            </div>

            {transferError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={transferring || pin.length !== 6}
                className="flex-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{transferring ? 'Processing...' : 'Confirm Payment'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Receipt */}
        {step === 3 && receipt && (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-black text-slate-900">Transfer Successful!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Amount has been atomically debited and credited.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-900">{receipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transferred To:</span>
                <span className="font-bold text-slate-900">{receipt.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient UPI ID:</span>
                <span className="font-mono text-slate-700">{receipt.recipientUpiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="text-base font-extrabold text-emerald-600">
                  ₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2">
                <span className="text-slate-500">New Available Balance:</span>
                <span className="font-bold text-slate-900">
                  ₹{receipt.newBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={resetModal}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
