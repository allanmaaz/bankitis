'use client';

import React from 'react';
import { Shield, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AuditItem {
  id: string;
  action: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: any;
  createdAt: Date | string;
}

interface AuditLogViewProps {
  logs: AuditItem[];
}

export function AuditLogView({ logs }: AuditLogViewProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center">
            <Shield className="w-4 h-4 mr-2 text-indigo-600" />
            Security & Audit Activity Trail
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system logs recorded for security compliance and session auditing
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No audit records found.
          </div>
        ) : (
          logs.map((log) => {
            const isAlert = log.action.includes('FAILED') || log.action.includes('LOCK');
            const isSuccess = log.action.includes('SUCCESS') || log.action.includes('EXECUTED');

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs"
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">
                    {isAlert ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Info className="w-4 h-4 text-sky-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">
                        {log.action}
                      </span>
                      {log.ipAddress && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          IP: {log.ipAddress}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {typeof log.details === 'object'
                          ? JSON.stringify(log.details).replace(/[{"}]/g, ' ')
                          : String(log.details)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center text-[11px] text-slate-400 shrink-0 ml-3">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

