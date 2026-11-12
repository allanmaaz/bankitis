import React from 'react';
import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';

export default function SpendingAnalytics({ transactions = [], currentAccount }) {
  const userTxns = transactions.filter(
    (t) => t.senderAccountId === currentAccount?.id || t.receiverAccountId === currentAccount?.id
  );

  let totalSpent = 0;
  let totalReceived = 0;
  const categories = {};

  userTxns.forEach((t) => {
    if (t.senderAccountId === currentAccount?.id) {
      totalSpent += t.amount;
      const cat = t.category || 'GENERAL';
      categories[cat] = (categories[cat] || 0) + t.amount;
    } else {
      totalReceived += t.amount;
    }
  });

  const categoryEntries = Object.entries(categories).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base text-slate-900">Analytics</h2>
        <span className="text-xs text-slate-400 font-medium">Monthly</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Spent</span>
          </div>
          <div className="text-lg font-bold text-slate-900">
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-1.5 text-slate-500 text-xs font-medium mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Received</span>
          </div>
          <div className="text-lg font-bold text-slate-900">
            ₹{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        {categoryEntries.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">
            No expense data yet
          </div>
        ) : (
          categoryEntries.map(([category, amount]) => {
            const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
            return (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">{category}</span>
                  <span className="text-slate-500">
                    ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
