import React from 'react';
import { formatCurrency } from '../utils/dateUtils';

interface IPhoneMainActionsProps {
  onOpenFullBalance: () => void;
  totalIOwe: number;
  totalOwedToMe: number;
  currency: string;
}

export const IPhoneMainActions: React.FC<IPhoneMainActionsProps> = ({
  onOpenFullBalance,
  totalIOwe,
  totalOwedToMe,
  currency,
}) => {
  const netBalance = totalOwedToMe - totalIOwe;

  return (
    <div 
      onClick={onOpenFullBalance}
      className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[0.99] transition-all space-y-3"
    >
      {/* Top Row: Primary Net Balance & Breakdown link */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider block mb-0.5">
            Net Standing
          </span>
          <div className={`text-xl sm:text-2xl font-black tabular-nums tracking-tight whitespace-nowrap ${
            netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
          }`}>
            <span className="mr-1 font-bold">{netBalance >= 0 ? '+' : '−'}</span>
            <span>{formatCurrency(Math.abs(netBalance), currency)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg ${
            netBalance >= 0 
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60' 
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
          }`}>
            {netBalance >= 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>
      </div>

      {/* Bottom Row: 2 Distinct Equal-Width Balance Cards (never overlap or stack awkwardly) */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-zinc-100 dark:border-zinc-800">
        {/* Receivables (Owed to You) */}
        <div className="bg-zinc-50/80 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider truncate">
              Owed to You
            </span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums truncate">
            <span className="text-emerald-700 dark:text-emerald-400 mr-0.5 font-bold">+</span>
            {formatCurrency(totalOwedToMe, currency)}
          </div>
        </div>

        {/* Payables (You Owe) */}
        <div className="bg-zinc-50/80 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider truncate">
              You Owe
            </span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums truncate">
            <span className="text-rose-700 dark:text-rose-400 mr-0.5 font-bold">−</span>
            {formatCurrency(totalIOwe, currency)}
          </div>
        </div>
      </div>
    </div>
  );
};
