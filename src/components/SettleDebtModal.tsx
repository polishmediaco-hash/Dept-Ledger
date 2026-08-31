import React, { useState } from 'react';
import { DebtItem } from '../types';
import { formatCurrency, getDaysUntilDue } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Check, 
  RotateCcw,
  ChevronRight
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
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-50 rounded-t-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col mx-auto max-w-[500px]"
          >
            {/* iOS Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-zinc-900 leading-tight">Settle Debts</h2>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{activeDebtsCount} Active Records</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters & Search */}
            <div className="p-4 bg-white border-b border-zinc-100 space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-100 rounded-2xl text-sm font-bold text-zinc-900 outline-none focus:bg-zinc-200 transition-colors"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {[
                  { id: 'all', label: 'All Active' },
                  { id: 'i_owe', label: 'I Owe' },
                  { id: 'owed_to_me', label: 'Owed' },
                  { id: 'settled', label: 'Settled' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterDirection(tab.id as any)}
                    className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap uppercase tracking-widest transition-all ${
                      filterDirection === tab.id 
                        ? 'bg-zinc-900 text-white shadow-lg' 
                        : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {displayList.length > 0 ? (
                displayList.map((debt) => {
                  const balance = debt.amount - debt.paidAmount;
                  const isSettled = balance <= 0.001;
                  const isOwedToMe = debt.direction === 'owed_to_me';

                  return (
                    <div
                      key={debt.id}
                      className="bg-white rounded-[24px] border border-zinc-100 p-4 flex items-center justify-between shadow-sm active:scale-98 transition-transform"
                    >
                      <div className="flex-1 min-w-0 pr-2" onClick={() => onSelectDebt(debt)}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${isSettled ? 'bg-zinc-300' : isOwedToMe ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <h4 className="text-sm font-black text-zinc-900 truncate">{debt.contact.name}</h4>
                        </div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">{debt.title || 'General'}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className={`text-sm font-black ${isSettled ? 'text-zinc-300 line-through' : isOwedToMe ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {formatCurrency(balance, currency)}
                          </p>
                          <p className="text-[10px] font-bold text-zinc-400">Balance</p>
                        </div>
                        
                        {isSettled ? (
                          <button
                            onClick={() => handleSettle(debt)}
                            className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSettle(debt)}
                            className="h-10 px-4 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1 active:scale-90 transition-transform"
                          >
                            <Check className="w-4 h-4" /> Settle
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center">
                  <CheckCircle2 className="w-12 h-12 text-zinc-100 mx-auto mb-4" />
                  <p className="text-sm font-black text-zinc-300 uppercase tracking-widest">No matching records</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-zinc-100 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-zinc-950 text-white font-bold shadow-lg shadow-zinc-950/20 active:scale-95 transition-transform"
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
