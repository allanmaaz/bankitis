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
  const [step, setStep] = useState(1);
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
      setTransferError('PIN must be 6 digits');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-sm">
            {step === 1 && 'Transfer Funds'}
            {step === 2 && 'Confirm Transfer'}
            {step === 3 && 'Transfer Complete'}
          </h3>
          <button
            onClick={resetModal}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Details Entry */}
        {step === 1 && (
          <form onSubmit={handleProceedToReview} className="p-6 space-y-4">
            {beneficiaries.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
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
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-left shrink-0 transition-all cursor-pointer"
                    >
                      <div className="font-medium text-slate-900">{b.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{b.upiId}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Recipient UPI ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  required
                  placeholder="UPI ID"
                  value={recipientUpi}
                  onChange={(e) => {
                    setRecipientUpi(e.target.value);
                    setResolvedRecipient(null);
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-slate-900"
                />
                <button
                  type="button"
                  onClick={() => handleResolve()}
                  disabled={resolving || !recipientUpi}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  {resolving ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              {resolvedRecipient && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-emerald-950">{resolvedRecipient.name}</span>
                      <span className="text-[10px] text-emerald-700 ml-1.5 font-mono">
                        ({resolvedRecipient.upiId})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {resolveError && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-2 border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{resolveError}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-slate-600">Amount (₹)</label>
                <span className="text-[10px] text-slate-400">
                  Available: ₹{currentAccount.balance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-medium text-slate-400 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  max="100000"
                  step="any"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-base font-semibold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
                >
                  <option value="GENERAL">General</option>
                  <option value="FOOD">Food</option>
                  <option value="SHOPPING">Shopping</option>
                  <option value="BILLS">Bills</option>
                  <option value="SERVICES">Services</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Note</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
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
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Review & PIN */}
        {step === 2 && (
          <form onSubmit={handleConfirmTransfer} className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-medium text-slate-900">{resolvedRecipient?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UPI ID:</span>
                <span className="font-mono text-slate-700">{resolvedRecipient?.upiId}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Amount:</span>
                <span className="text-sm font-bold text-slate-900">
                  ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Enter 6-Digit PIN
              </label>
              <input
                type="password"
                maxLength={6}
                required
                autoFocus
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.8em] text-xl font-mono py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-slate-900"
              />
            </div>

            {transferError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{transferError}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={transferring || pin.length !== 6}
                className="flex-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>{transferring ? 'Processing...' : 'Confirm'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Receipt */}
        {step === 3 && receipt && (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">Transfer Successful</h4>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Ref:</span>
                <span className="font-mono text-slate-800">{receipt.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">To:</span>
                <span className="font-medium text-slate-900">{receipt.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">UPI ID:</span>
                <span className="font-mono text-slate-700">{receipt.recipientUpiId}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">Amount:</span>
                <span className="text-sm font-bold text-emerald-600">
                  ₹{receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={resetModal}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
