import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, AlertCircle, Send } from 'lucide-react';
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
      setSuccess(`Beneficiary saved`);
      setUpiId('');
      setNickname('');
      setShowAddForm(false);
      if (onRefresh) onRefresh();
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-sm">Beneficiaries</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500">
              Saved ({beneficiaries.length})
            </span>
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setError('');
                setSuccess('');
              }}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancel' : 'Add'}</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAdd} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  required
                  placeholder="UPI ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nickname (Optional)</label>
                <input
                  type="text"
                  placeholder="Nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
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
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs transition-all cursor-pointer"
              >
                {loading ? 'Saving...' : 'Save Beneficiary'}
              </button>
            </form>
          )}

          {success && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center space-x-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {beneficiaries.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No saved beneficiaries
              </div>
            ) : (
              beneficiaries.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-900 text-xs">{b.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{b.upiId}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (onSelectBeneficiary) onSelectBeneficiary(b.upiId);
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
