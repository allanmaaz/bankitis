import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, Shield, AlertCircle, ArrowLeft } from 'lucide-react';
import { authenticateUser } from '../lib/bankingEngine';

export default function AdminLoginForm({ onAdminLoginSuccess, onBackToPortal }) {
  const [email, setEmail] = useState('');
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
        setError('Access Denied. Administrator account required.');
        return;
      }
      onAdminLoginSuccess(res.user);
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-white">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-xs text-slate-400">Sign in to manage banking operations</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-slate-600"
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
              className="w-full py-2.5 bg-white hover:bg-slate-200 disabled:opacity-50 text-slate-900 rounded-xl font-medium text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onBackToPortal}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer inline-flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
