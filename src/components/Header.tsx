import React from 'react';
import { 
  DollarSign, 
  Plus, 
  Sparkles, 
  Download, 
  RotateCcw
} from 'lucide-react';

interface HeaderProps {
  currency: string;
  onCurrencyChange: (curr: string) => void;
  onOpenAddModal: () => void;
  onOpenPriorityAdvisor: () => void;
  onOpenExportModal: () => void;
  urgentCount: number;
}

const CURRENCIES = [
  { symbol: 'DZD', code: 'DZD (د.ج - Principal)' },
  { symbol: '$', code: 'USD / CAD / AUD' },
  { symbol: '€', code: 'EUR (€)' },
  { symbol: '£', code: 'GBP (£)' },
  { symbol: '¥', code: 'JPY / CNY' },
  { symbol: '₹', code: 'INR (₹)' },
  { symbol: 'CHF', code: 'CHF' },
  { symbol: 'zł', code: 'PLN' },
  { symbol: 'kr', code: 'SEK / NOK' },
  { symbol: 'R$', code: 'BRL' },
  { symbol: 'MX$', code: 'MXN' },
];

export const Header: React.FC<HeaderProps> = ({
  currency,
  onCurrencyChange,
  onOpenAddModal,
  onOpenPriorityAdvisor,
  onOpenExportModal,
  urgentCount,
}) => {
  return (
    <header className="border-b border-zinc-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">Debt & Loan Ledger</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                Personal & Business
              </span>
            </div>
            <p className="text-xs text-zinc-500 hidden sm:block">
              Clean tracker for who owes you, who you owe, aging days & payoff priorities
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Currency selector */}
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs text-zinc-700">
            <span className="text-zinc-400 font-medium">Currency:</span>
            <select
              id="currency-selector"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="bg-transparent font-bold text-zinc-900 focus:outline-none cursor-pointer"
            >
              {CURRENCIES.map((c) => (
                <option key={c.symbol} value={c.symbol}>
                  {c.symbol} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Advisor Button */}
          <button
            id="open-priority-advisor-btn"
            onClick={onOpenPriorityAdvisor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors shadow-2xs relative"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Priority Advisor</span>
            {urgentCount > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Backup / Export */}
          <button
            id="open-export-modal-btn"
            onClick={onOpenExportModal}
            className="p-1.5 rounded-xl text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:bg-zinc-100 transition-colors"
            title="Export CSV / JSON Backup"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* New Record Button */}
          <button
            id="open-add-debt-modal-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 text-white transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Record</span>
          </button>
        </div>
      </div>
    </header>
  );
};
