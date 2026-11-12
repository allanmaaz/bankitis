import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { authenticateUser } from '../lib/bankingEngine';

export default function AdminLoginForm({ onAdminLoginSuccess, onBackToPortal }) {
  const [email, setEmail] = useState('admin@bank.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = authenticateUser(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role !== 'ADMIN') {
        setError('Access Denied. Only authorized bank administrators may access this portal.');
        return;
      }
      onAdminLoginSuccess(res.user);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-600/30 text-white">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Bank Administration Portal</h1>
            <p className="text-xs text-slate-400">Authorized System Officers & Compliance Operators Only</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@bank.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Administrator Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20 cursor-pointer"
            >
              <span>{loading ? 'Verifying Admin Access...' : 'Authenticate as System Admin'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <button
              type="button"
              onClick={onBackToPortal}
              className="hover:text-slate-300 flex items-center space-x-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customer Portal</span>
            </button>
            <span className="font-mono text-[10px]">Security Clearance: L4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
