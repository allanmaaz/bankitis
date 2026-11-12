import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, X, ExternalLink, Copy, Check } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials, getSupabaseClient } from '../lib/supabaseClient';
import { syncDatabaseWithSupabase } from '../lib/bankingEngine';

export default function DatabaseSettingsModal({ isOpen, onClose, onConnected }) {
  const creds = getSupabaseCredentials();
  const [url, setUrl] = useState(creds.url);
  const [key, setKey] = useState(creds.key);
  const [testing, setTesting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    setTesting(true);
    setStatusMsg(null);

    saveSupabaseCredentials(url, key);
    const client = getSupabaseClient();

    if (!client) {
      setTesting(false);
      setStatusMsg({ success: false, text: 'Please enter both valid Supabase Project URL and Anon Key.' });
      return;
    }

    try {
      // Test querying the users table
      const { data, error } = await client.from('users').select('id').limit(1);
      if (error) {
        setTesting(false);
        setStatusMsg({
          success: false,
          text: `Connection failed: ${error.message}. Make sure you executed the SQL schema script in Supabase!`,
        });
        return;
      }

      // Sync data
      const synced = await syncDatabaseWithSupabase();
      setTesting(false);
      setStatusMsg({
        success: true,
        text: 'Connected successfully to Cloud PostgreSQL (Supabase)! Live synchronization active.',
      });

      if (onConnected) onConnected(synced);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setTesting(false);
      setStatusMsg({ success: false, text: `Error: ${err.message}` });
    }
  };

  const handleDisconnect = () => {
    saveSupabaseCredentials('', '');
    setUrl('');
    setKey('');
    setStatusMsg({ success: true, text: 'Disconnected from Supabase. Reverted to Local Engine.' });
    if (onConnected) onConnected(null);
  };

  const handleCopySqlHint = () => {
    navigator.clipboard.writeText('-- Run supabase_schema.sql from project root');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Cloud Database Setup</h3>
              <p className="text-[11px] text-slate-500">Connect to Free Supabase PostgreSQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center justify-between">
              <span>Quick 2-Minute Setup:</span>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:underline inline-flex items-center space-x-0.5 text-[11px]"
              >
                <span>supabase.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-500">
              <li>Create a free project on <strong>supabase.com</strong>.</li>
              <li>Go to <strong>SQL Editor</strong> & paste <code>supabase_schema.sql</code>.</li>
              <li>Go to <strong>Project Settings → API</strong> and copy URL & anon key.</li>
            </ol>
          </div>

          <form onSubmit={handleTestAndSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                required
                placeholder="https://xyzproject.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Supabase Anon (Public) Key
              </label>
              <input
                type="text"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-slate-900"
              />
            </div>

            {statusMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 border ${
                  statusMsg.success
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {statusMsg.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}

            <div className="pt-2 flex space-x-2">
              <button
                type="submit"
                disabled={testing || !url || !key}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{testing ? 'Connecting...' : 'Connect to Supabase'}</span>
              </button>

              {creds.isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                >
                  Disconnect
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
