import React, { useState } from 'react';
import { Mail, Lock, User, Phone, AtSign, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { authenticateUser, registerCustomer } from '../lib/bankingEngine';

export default function AuthTabs({ onAuthSuccess, onNavigateAdmin }) {
  const [tab, setTab] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Register form state
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [upiHandle, setUpiHandle] = useState('');
  const [pin, setPin] = useState('');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    const res = authenticateUser(loginEmail, loginPassword);
    setLoading(false);

    if (res.success) {
      onAuthSuccess(res.user);
    } else {
      setLoginError(res.error);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 6) {
      setRegError('PIN must be 6 digits');
      return;
    }

    setLoading(true);
    setRegError('');

    const res = registerCustomer({
      name,
      email: regEmail,
      password: regPassword,
      phone,
      upiHandle,
      pin,
    });

    setLoading(false);

    if (res.success) {
      onAuthSuccess(res.user);
    } else {
      setRegError(res.error);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
      <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => {
            setTab('login');
            setLoginError('');
            setRegError('');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            tab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('register');
            setLoginError('');
            setRegError('');
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            tab === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Register
        </button>
      </div>

      {tab === 'login' && (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !loginEmail || !loginPassword}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Administrator Portal →
            </button>
          </div>
        </form>
      )}

      {tab === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="Email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">UPI ID</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="handle"
                  value={upiHandle}
                  onChange={(e) => setUpiHandle(e.target.value)}
                  className="w-full pl-3 pr-11 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-slate-900"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                  @bank
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">6-Digit PIN</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                maxLength={6}
                required
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-mono tracking-widest focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {regError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center space-x-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{regError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !regEmail || !regPassword || !phone || !upiHandle || pin.length !== 6}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{loading ? 'Creating...' : 'Create Account'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
