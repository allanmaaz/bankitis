'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface SpendingAnalyticsProps {
  analytics: {
    categoryData: { name: string; value: number }[];
    monthlyCashFlow: { month: string; debited: number; credited: number }[];
  };
}

const CATEGORY_COLORS = [
  '#0284c7', // sky-600
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // violet-500
  '#64748b', // slate-500
];

export function SpendingAnalytics({ analytics }: SpendingAnalyticsProps) {
  const { categoryData, monthlyCashFlow } = analytics;

  const totalSpent = categoryData.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Cash Flow Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-sky-600" />
                Monthly Cash Flow Trends
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Incoming credits vs outgoing transfers
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[11px] font-semibold">
              <span className="flex items-center text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5" />
                Credited
              </span>
              <span className="flex items-center text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1.5" />
                Debited
              </span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyCashFlow} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="credited" name="Credited (+)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="debited" name="Debited (-)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Reporting Period:</span>
          <span className="font-semibold text-slate-700">Last 6 Months Rolling</span>
        </div>
      </div>

      {/* Spending by Category Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <PieIcon className="w-4 h-4 mr-2 text-indigo-600" />
                Expenses by Category
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Expenses: <span className="font-bold text-slate-800">{formatCurrency(totalSpent)}</span>
              </p>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No debit spending records available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {categoryData.map((cat, idx) => {
                  const percentage = totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0;
                  return (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                        />
                        <span className="text-slate-700 truncate font-medium">{cat.name}</span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="font-bold text-slate-900">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Categorization:</span>
          <span className="font-semibold text-slate-700">Auto-Tagged per Transfer</span>
        </div>
      </div>
    </div>
  );
}

