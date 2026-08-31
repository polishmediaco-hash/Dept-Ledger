import React from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Columns, 
  Scale, 
  Sparkles, 
  ArrowDownLeft, 
  ArrowUpRight 
} from 'lucide-react';
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
  onOpenAddModal,
  onOpenSettleModal,
  onOpenFullBalance,
  unsettledCount,
  totalIOwe,
  totalOwedToMe,
  currency,
}) => {
  return (
    <div className="space-y-2 mb-4">
      {/* 3 Prominent Primary Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {/* 1. Add Debt Button */}
        <button
          id="btn-action-add-debt"
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-900 active:bg-zinc-800 text-white shadow-md active:scale-95 transition-all min-h-[76px] group relative overflow-hidden"
        >
          <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-extrabold tracking-tight">Add Debt</span>
          <span className="text-[10px] text-zinc-400">New Entry</span>
        </button>

        {/* 2. Settle Debt Button */}
        <button
          id="btn-action-settle-debt"
          onClick={onOpenSettleModal}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-600 active:bg-emerald-700 text-white shadow-md active:scale-95 transition-all min-h-[76px] group relative overflow-hidden"
        >
          <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center mb-1 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold tracking-tight">Settle Debt</span>
          <span className="text-[10px] text-emerald-100 font-medium">
            {unsettledCount} Unsettled
          </span>
        </button>

        {/* 3. Full Balance Button */}
        <button
          id="btn-action-full-balance"
          onClick={onOpenFullBalance}
          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-600 active:bg-indigo-700 text-white shadow-md active:scale-95 transition-all min-h-[76px] group relative overflow-hidden"
        >
          <div className="h-8 w-8 rounded-full bg-white/20 text-white flex items-center justify-center mb-1 transition-transform">
            <Columns className="w-4 h-4" />
          </div>
          <span className="text-xs font-extrabold tracking-tight">Full Balance</span>
          <span className="text-[10px] text-indigo-100 font-medium">2 Columns</span>
        </button>
      </div>

      {/* Mini 2-Column Balance Preview Strip */}
      <div 
        onClick={onOpenFullBalance}
        className="p-3 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs active:border-indigo-300 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-900 block">Balance Summary</span>
            <span className="text-[10px] text-zinc-500">Tap to inspect 2-column breakdown</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div>
            <span className="text-[9px] uppercase font-bold text-rose-500 block">I Owe</span>
            <span className="text-xs font-extrabold text-rose-700">
              {formatCurrency(totalIOwe, currency)}
            </span>
          </div>
          <div className="h-5 w-[1px] bg-zinc-200" />
          <div>
            <span className="text-[9px] uppercase font-bold text-emerald-500 block">Owed to Me</span>
            <span className="text-xs font-extrabold text-emerald-700">
              {formatCurrency(totalOwedToMe, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
