import React from 'react';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

interface IPhoneMainActionsProps {
  onOpenAddModal: () => void;
  onOpenSettleModal: () => void;
  onOpenFullBalance: () => void;
  unsettledCount: number;
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
      className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 active:scale-[0.99] transition-all mb-2"
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3">
        {/* Receivables (Owed to Me) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider truncate">Owed to You</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight whitespace-nowrap">
            <span className="mr-1 font-semibold">+</span>
            <span>{formatCurrency(totalOwedToMe, currency)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-zinc-200/80 dark:bg-zinc-800 shrink-0" />

        {/* Payables (I Owe) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider truncate">You Owe</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums tracking-tight whitespace-nowrap">
            <span className="mr-1 font-semibold">−</span>
            <span>{formatCurrency(totalIOwe, currency)}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-7 w-px bg-zinc-200/80 dark:bg-zinc-800 shrink-0" />

        {/* Net */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider truncate">Net</span>
          </div>
          <div className={`text-xs sm:text-sm font-bold tabular-nums tracking-tight whitespace-nowrap ${
            netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
          }`}>
            <span className="mr-1 font-semibold">{netBalance >= 0 ? '+' : '−'}</span>
            <span>{formatCurrency(Math.abs(netBalance), currency)}</span>
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
      </div>
    </div>
  );
};


