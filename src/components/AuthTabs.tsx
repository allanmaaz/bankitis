'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Phone,
  KeyRound,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { loginAction, registerAction } from '@/app/actions';

export function AuthTabs() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(null, formData);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials');
      }
    } catch {
      setErrorMsg('Authentication request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const pin = formData.get('upiPin') as string;
    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setErrorMsg('UPI PIN must be exactly 6 digits');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await registerAction(null, formData);
      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed');
      }
    } catch {
      setErrorMsg('Registration request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 border border-slate-200">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-sky-600/20 mb-3">
          T9
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Team-9 Digital Bank</h1>
        <p className="text-xs text-slate-500 mt-1">
          Secure Online Banking & Instant UPI Fund Transfer System
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            setMode('login');
            setErrorMsg(null);
          }}
          className={`py-2 rounded-lg transition-all ${
            mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('register');
            setErrorMsg(null);
          }}
          className={`py-2 rounded-lg transition-all ${
            mode === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* LOGIN FORM */}
      {mode === 'login' && (
        <div className="space-y-5">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. maaz@bank.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                Login Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Authorized Banking Personnel &amp; Registered Account Access Only
            </p>
          </div>
        </div>
      )}

      {/* REGISTER FORM */}
      {mode === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="fullName"
                required
                placeholder="e.g. Zaid Ahmed"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. zaid@bank.com"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                name="phoneNumber"
                required
                placeholder="+919876543299"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Create Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
              Set 6-Digit UPI PIN
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="upiPin"
                required
                maxLength={6}
                pattern="\d{6}"
                placeholder="6-digit numeric PIN (e.g. 123456)"
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Opening balance perk banner */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Includes <strong>₹50,000.00</strong> instant test balance and your personalized UPI ID!</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Open Account & Claim ₹50,000</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

