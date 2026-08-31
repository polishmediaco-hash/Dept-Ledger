import React, { useState } from 'react';
import { DebtItem } from '../types';
import { formatCurrency, getDaysUntilDue } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Search, 
  Check, 
  RotateCcw
} from 'lucide-react';

interface SettleDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: DebtItem[];
  currency: string;
  onQuickSettle: (debt: DebtItem) => void;
  onRecordPayment: (debt: DebtItem) => void;
  onSelectDebt: (debt: DebtItem) => void;
}

export const SettleDebtModal: React.FC<SettleDebtModalProps> = ({
  isOpen,
  onClose,
  debts,
  currency,
  onQuickSettle,
  onRecordPayment,
  onSelectDebt,
}) => {
  const [filterDirection, setFilterDirection] = useState<'all' | 'i_owe' | 'owed_to_me' | 'settled'>('all');
  const [search, setSearch] = useState('');

  const triggerConfetti = () => {
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
    });
  };

  const handleSettle = (debt: DebtItem) => {
    const isCurrentlySettled = (debt.amount - debt.paidAmount) <= 0.001;
    if (!isCurrentlySettled) {
      triggerConfetti();
    }
    onQuickSettle(debt);
  };

  const activeDebtsCount = debts.filter(d => (d.amount - d.paidAmount) > 0.001).length;

  const displayList = debts.filter(debt => {
    const isSettled = (debt.amount - debt.paidAmount) <= 0.001;
    if (filterDirection === 'settled') {
      if (!isSettled) return false;
    } else if (filterDirection === 'i_owe') {
      if (debt.direction !== 'i_owe' || isSettled) return false;
    } else if (filterDirection === 'owed_to_me') {
      if (debt.direction !== 'owed_to_me' || isSettled) return false;
    } else {
      if (isSettled) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        debt.contact.name.toLowerCase().includes(q) ||
        (debt.title || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-50 dark:bg-zinc-900 rounded-t-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col mx-auto max-w-[500px] border border-transparent dark:border-zinc-800"
          >
            {/* iOS Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Settle Debts</h2>
                  <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">{activeDebtsCount} active records</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters & Search */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: 'all', label: 'All Active' },
                  { id: 'i_owe', label: '− I Owe' },
                  { id: 'owed_to_me', label: '+ Owed' },
                  { id: 'settled', label: 'Settled' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterDirection(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      filterDirection === tab.id 
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs' 
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
              {displayList.length > 0 ? (
                displayList.map((debt) => {
                  const balance = debt.amount - debt.paidAmount;
                  const isSettled = balance <= 0.001;
                  const isOwedToMe = debt.direction === 'owed_to_me';

                  return (
                    <div
                      key={debt.id}
                      className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-3.5 flex items-center justify-between shadow-2xs transition-all"
                    >
                      <div className="flex-1 min-w-0 pr-2 cursor-pointer" onClick={() => onSelectDebt(debt)}>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`w-2 h-2 rounded-full ${isSettled ? 'bg-zinc-300 dark:bg-zinc-600' : isOwedToMe ? 'theme-rec-bg' : 'theme-pay-bg'}`} />
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{debt.contact.name}</h4>
                        </div>
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium truncate">{debt.title || 'General'}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className={`text-xs font-bold tabular-nums ${
                            isSettled 
                              ? 'text-zinc-400 dark:text-zinc-500 line-through' 
                              : isOwedToMe 
                              ? 'theme-rec-text' 
                              : 'theme-pay-text'
                          }`}>
                            {isSettled ? '' : isOwedToMe ? '+' : '−'}{formatCurrency(balance, currency)}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">Balance</p>
                        </div>
                        
                        {isSettled ? (
                          <button
                            onClick={() => handleSettle(debt)}
                            className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                            title="Reopen record"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSettle(debt)}
                            className="h-8 px-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" /> Settle
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <CheckCircle2 className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                  <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500">No matching records</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs active:scale-98 transition-transform cursor-pointer"
              >
                Close & Finish
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
