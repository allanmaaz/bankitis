import React from 'react';
import { Clock } from 'lucide-react';

export default function AuditLogView({ auditLogs = [] }) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base text-slate-900">Activity Log</h2>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {auditLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No activity logged
          </div>
        ) : (
          auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-slate-800 text-[11px]">
                  {log.action}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleTimeString('en-IN')}
                </span>
              </div>
              <p className="text-slate-600 text-xs">{log.details}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
