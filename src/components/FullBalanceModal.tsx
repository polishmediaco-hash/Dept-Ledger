import React from 'react';
import { DebtItem } from '../types';
import { formatCurrency } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  PieChart, 
  Plus,
  Scale
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
  onOpenAddModal,
}) => {
  const activeDebts = debts.filter(d => (d.amount - d.paidAmount) > 0.001);

  const totalIOwe = activeDebts
    .filter(d => d.direction === 'i_owe')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const totalOwedToMe = activeDebts
    .filter(d => d.direction === 'owed_to_me')
    .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);

  const netBalance = totalOwedToMe - totalIOwe;

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
            className="w-full max-w-2xl bg-white dark:bg-zinc-900 sm:rounded-3xl overflow-hidden flex flex-col h-[92vh] sm:h-[85vh] shadow-2xl border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-xs">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Financial Overview</h2>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide uppercase">Full Balance Ledger</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Main Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Owed to You</span>
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums mt-2">
                      {formatCurrency(totalOwedToMe, currency)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                      Receivable
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold mb-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">You Owe</span>
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums mt-2">
                      {formatCurrency(totalIOwe, currency)}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-[10px] font-medium bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-md">
                      Payable
                    </span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Category Distribution</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(debtsByCategory).map(([cat, amount], idx) => (
                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 p-3.5 rounded-xl flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 shadow-2xs">
                        <PieChart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase">{cat}</div>
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatCurrency(Number(amount), currency)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Health Summary */}
              <div className="p-5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-zinc-900 dark:text-zinc-100">
                <h3 className="text-sm font-bold mb-1">Net Position</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                  Your overall net balance is{' '}
                  <strong className={`font-bold tabular-nums ${netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    <span className="mr-1">{netBalance >= 0 ? '+' : '−'}</span>
                    <span>{formatCurrency(Math.abs(netBalance), currency)}</span>
                  </strong>
                </p>
                <div className="flex gap-2">
                  <div className={`px-2.5 py-1 text-[11px] font-medium rounded-lg ${
                    netBalance >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                  }`}>
                    {netBalance >= 0 ? 'Surplus (+)' : 'Deficit (–)'}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex gap-2.5">
              <button 
                onClick={onOpenAddModal}
                className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Record
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

