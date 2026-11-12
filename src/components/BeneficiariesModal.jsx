import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, AlertCircle, Trash2, Send } from 'lucide-react';
import { addBeneficiaryToAccount } from '../lib/bankingEngine';

export default function BeneficiariesModal({
  isOpen,
  onClose,
  currentUser,
  beneficiaries = [],
  onRefresh,
  onSelectBeneficiary,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const res = addBeneficiaryToAccount({
      userId: currentUser.id,
      upiId,
      nickname,
    });

    setLoading(false);
    if (res.success) {
      setSuccess(`Beneficiary ${res.beneficiary.name} verified and saved!`);
      setUpiId('');
      setNickname('');
      setShowAddForm(false);
      if (onRefresh) onRefresh();
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Beneficiary Management</h3>
            <p className="text-[11px] text-slate-500">Save and manage trusted UPI recipients</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Saved Beneficiaries ({beneficiaries.length})
            </span>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setError('');
                setSuccess('');
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Add New'}</span>
            </button>
          </div>

          {/* Add Beneficiary Sub-form */}
          {showAddForm && (
            <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800">Add & Verify New Beneficiary</h4>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Recipient UPI ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rahul@bank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Custom Nickname (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Colleague"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !upiId}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                {loading ? 'Verifying...' : 'Validate & Save Beneficiary'}
              </button>
            </form>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center space-x-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* List of Beneficiaries */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {beneficiaries.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No saved beneficiaries yet. Click "Add New" or select from directory.
              </div>
            ) : (
              beneficiaries.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{b.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{b.upiId}</div>
                    {b.nickname && b.nickname !== b.name && (
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-medium">
                        {b.nickname}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectBeneficiary) onSelectBeneficiary(b.upiId);
                      onClose();
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs"
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
