import React from 'react';
import { ShieldCheck, History, Clock } from 'lucide-react';

export default function AuditLogView({ auditLogs = [] }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <span>Immutable Compliance & Security Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500">
            Cryptographic ledger timestamps for all customer operations
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No audit records logged yet.
          </div>
        ) : (
          auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sky-700 bg-sky-100/60 px-2 py-0.5 rounded-md text-[10px]">
                  {log.action}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-mono">
                  <Clock className="w-3 h-3 mr-0.5" />
                  {new Date(log.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-slate-700 text-xs mt-1 leading-relaxed">{log.details}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
