import React, { useState, useMemo } from 'react';
import { DebtItem } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { Filter } from 'lucide-react';

interface BalanceMonthlyChartProps {
  debts: DebtItem[];
  currency: string;
}

export const BalanceMonthlyChart: React.FC<BalanceMonthlyChartProps> = ({
  debts,
  currency,
}) => {
  const [filterScope, setFilterScope] = useState<'all' | 'personal' | 'business'>('all');

  const recColor = '#10B981'; // Emerald 500
  const payColor = '#F43F5E'; // Rose 500

  const filteredDebts = useMemo(() => {
    if (filterScope === 'all') return debts;
    return debts.filter(d => d.category === filterScope);
  }, [debts, filterScope]);

  // Compute 6-month timeline (past 2 months, current month, next 3 months)
  const monthlyData = useMemo(() => {
    const today = new Date();
    const months: { monthKey: string; label: string; date: Date }[] = [];

    for (let i = -2; i <= 3; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${year}-${month}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      months.push({ monthKey, label, date: d });
    }

    return months.map(({ monthKey, label }) => {
      let owedToMe = 0;
      let iOwe = 0;

      filteredDebts.forEach(d => {
        const balance = d.amount - d.paidAmount;
        if (balance <= 0) return;

        // Use dueDate if available, otherwise fallback to startDate
        const relevantDate = d.dueDate || d.startDate || '';
        if (relevantDate.startsWith(monthKey)) {
          if (d.direction === 'owed_to_me') {
            owedToMe += balance;
          } else {
            iOwe += balance;
          }
        }
      });

      const net = owedToMe - iOwe;

      return {
        month: label,
        monthKey,
        owedToMe: Math.round(owedToMe * 100) / 100,
        iOwe: Math.round(iOwe * 100) / 100,
        net: Math.round(net * 100) / 100,
      };
    });
  }, [filteredDebts]);

  // Totals across active debts
  const totalReceivable = useMemo(() => {
    return filteredDebts
      .filter(d => d.direction === 'owed_to_me')
      .reduce((sum, d) => sum + Math.max(0, d.amount - d.paidAmount), 0);
  }, [filteredDebts]);

  const totalPayable = useMemo(() => {
    return filteredDebts
      .filter(d => d.direction === 'i_owe')
      .reduce((sum, d) => sum + Math.max(0, d.amount - d.paidAmount), 0);
  }, [filteredDebts]);

  const netStanding = totalReceivable - totalPayable;

  return (
    <div className="space-y-3">
      {/* Category Scope Filter Pills */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <Filter className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span>Scope:</span>
        </div>
        <div className="flex items-center bg-zinc-100/90 dark:bg-zinc-800/80 p-1 rounded-xl gap-1 border border-zinc-200/70 dark:border-zinc-700/70">
          {(['all', 'personal', 'business'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterScope(tab)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all capitalize cursor-pointer ${
                filterScope === tab
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {tab === 'all' ? 'All Spaces' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-0.5">
              6-Month Cashflow Schedule
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Receivables vs. Payables
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md ${
              netStanding >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
            }`}>
              Net {netStanding >= 0 ? '+' : '−'}{formatCurrency(Math.abs(netStanding), currency)}
            </span>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="h-52 w-full -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#71717A', fontSize: 11, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#A1A1AA', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-zinc-900 dark:bg-zinc-950 text-white p-2.5 rounded-xl text-xs shadow-xl border border-zinc-800 space-y-1">
                        <div className="font-bold text-zinc-300 border-b border-zinc-800 pb-1">
                          {label}
                        </div>
                        <div className="flex items-center justify-between gap-4 text-emerald-400 font-medium">
                          <span>Owed to You:</span>
                          <span className="font-bold">{formatCurrency(data.owedToMe, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-rose-400 font-medium">
                          <span>You Owe:</span>
                          <span className="font-bold">{formatCurrency(data.iOwe, currency)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-1 border-t border-zinc-800 font-bold text-zinc-100">
                          <span>Net:</span>
                          <span className={data.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {data.net >= 0 ? '+' : '−'}{formatCurrency(Math.abs(data.net), currency)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={7}
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px', fontWeight: 500 }}
              />
              <Bar 
                name="Owed to You" 
                dataKey="owedToMe" 
                fill={recColor} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={24}
              />
              <Bar 
                name="You Owe" 
                dataKey="iOwe" 
                fill={payColor} 
                radius={[4, 4, 0, 0]} 
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Month Highlights */}
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2 text-xs">
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/70">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">Owed to You</span>
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {formatCurrency(totalReceivable, currency)}
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/70">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider">You Owe</span>
            </div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {formatCurrency(totalPayable, currency)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
