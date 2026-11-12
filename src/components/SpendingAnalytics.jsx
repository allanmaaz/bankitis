import React from 'react';
import { PieChart, TrendingUp, TrendingDown, CreditCard, Sparkles } from 'lucide-react';

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
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-lg text-slate-900 flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-indigo-600" />
            <span>Spending Analytics & Insights</span>
          </h2>
          <p className="text-xs text-slate-500">Live breakdown of outgoing and incoming funds</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
          Monthly View
        </span>
      </div>

      {/* Top 2 Metric Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
          <div className="flex items-center space-x-2 text-rose-700 text-xs font-bold mb-1">
            <TrendingDown className="w-4 h-4" />
            <span>Total Debited / Spent</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-rose-950">
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Total Credited / Received</span>
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-950">
            ₹{totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Category Distribution
        </h3>

        {categoryEntries.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No outgoing expense data available yet. Make your first transfer!
          </div>
        ) : (
          categoryEntries.map(([category, amount]) => {
            const percentage = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
            return (
              <div key={category} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800">{category}</span>
                  <span className="text-slate-500">
                    ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
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
