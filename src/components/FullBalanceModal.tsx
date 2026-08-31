import React, { useState } from 'react';
import { DebtItem } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  TrendingUp,
  TrendingDown,
  PieChart,
  Plus,
  DollarSign
} from 'lucide-react';

interface FullBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: DebtItem[];
  currency: string;
  onQuickSettle: (debt: DebtItem) => void;
  onSelectDebt: (debt: DebtItem) => void;
  onOpenAddModal: () => void;
}

export const FullBalanceModal: React.FC<FullBalanceModalProps> = ({
  isOpen,
  onClose,
  debts,
  currency,
  onSelectDebt,
  onOpenAddModal,
}) => {
  const activeDebts = debts.filter(d => (d.amount - d.paidAmount) > 0.001);

  const totalIOwe = activeDebts
    .filter(d => d.direction === 'i_owe')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalOwedToMe = activeDebts
    .filter(d => d.direction === 'owed_to_me')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const debtsByCategory = activeDebts.reduce((acc, d) => {
    acc[d.category] = (acc[d.category] || 0) + (d.amount - d.paidAmount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-2xl bg-white sm:rounded-[32px] overflow-hidden flex flex-col h-[92vh] sm:h-[85vh] shadow-2xl border border-zinc-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-emerald-400 flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Financial Overview</h2>
                  <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Full Balance Ledger</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8">
              {/* Main Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white border-2 border-emerald-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-emerald-600 font-black mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-[0.15em]">Money Owed To Me</span>
                    </div>
                    <div className="text-4xl font-black text-zinc-900">{currency}{totalOwedToMe.toLocaleString()}</div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 flex-1 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600">INCOME</span>
                  </div>
                </div>

                <div className="bg-white border-2 border-rose-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-rose-600 font-black mb-1">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-[10px] uppercase tracking-[0.15em]">Money I Owe</span>
                    </div>
                    <div className="text-4xl font-black text-zinc-900">{currency}{totalIOwe.toLocaleString()}</div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 flex-1 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <span className="text-[10px] font-black text-rose-600">DEBT</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest ml-1">Category Distribution</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(debtsByCategory).map(([cat, amount], idx) => (
                    <div key={idx} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm">
                        <PieChart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase">{cat}</div>
                        <div className="text-base font-bold text-zinc-900">{currency}{amount.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charts placeholder/info */}
              <div className="mt-8 p-6 bg-zinc-900 rounded-[24px] text-white overflow-hidden relative">
                 <div className="relative z-10">
                   <h3 className="text-lg font-bold mb-1">Financial Health</h3>
                   <p className="text-zinc-400 text-sm mb-4">Your net balance is {currency}{(totalOwedToMe - totalIOwe).toLocaleString()}</p>
                   <div className="flex gap-2">
                     <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/30 uppercase">Optimized</div>
                     <div className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded-full border border-zinc-700 uppercase">Verified</div>
                   </div>
                 </div>
                 <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12" />
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex gap-3">
              <button 
                onClick={onOpenAddModal}
                className="flex-1 py-4 bg-zinc-100 text-zinc-900 border border-zinc-200 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Plus className="w-5 h-5" /> Add Entry
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl shadow-zinc-900/10 active:scale-[0.98] transition-all"
              >
                Close Insights
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

