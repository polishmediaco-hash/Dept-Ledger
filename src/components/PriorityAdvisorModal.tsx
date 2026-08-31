import React, { useState } from 'react';
import { DebtItem } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDurationElapsed, 
  getDaysUntilDue, 
  getPriorityScore 
} from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Zap, 
  Calendar, 
  CreditCard,
  User,
  Briefcase
} from 'lucide-react';

interface PriorityAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: DebtItem[];
  currency: string;
  onRecordPayment: (debt: DebtItem) => void;
  onViewDetails: (debt: DebtItem) => void;
}

type Strategy = 'urgency' | 'snowball' | 'avalanche';

export const PriorityAdvisorModal: React.FC<PriorityAdvisorModalProps> = ({
  isOpen,
  onClose,
  debts,
  currency,
  onRecordPayment,
  onViewDetails,
}) => {
  const [strategy, setStrategy] = useState<Strategy>('urgency');

  // Filter only active debts I OWE
  const payables = debts.filter(d => d.direction === 'i_owe' && (d.amount - d.paidAmount) > 0.001);

  // Sorting based on strategy
  const sortedPayables = [...payables].sort((a, b) => {
    const balA = a.amount - a.paidAmount;
    const balB = b.amount - b.paidAmount;

    if (strategy === 'snowball') {
      return balA - balB; // Smallest balance first
    } else if (strategy === 'avalanche') {
      return balB - balA; // Largest balance first
    } else {
      // Smart urgency & deadlines
      return getPriorityScore(b) - getPriorityScore(a);
    }
  });

  const totalOwed = payables.reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);
  const overdueCount = payables.filter(d => d.dueDate && getDaysUntilDue(d.dueDate) < 0).length;
  const urgentCount = payables.filter(d => d.priority === 'urgent').length;

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
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-950 text-white rounded-t-[32px] shadow-2xl overflow-hidden h-[94vh] flex flex-col mx-auto max-w-[600px]"
          >
            {/* iOS Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black leading-tight">Priority Advisor</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Strategic Pay-Off Ranking</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Stats Banner */}
            <div className="px-6 py-6 bg-zinc-900 shrink-0 border-b border-zinc-800">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Payables</p>
                  <p className="text-3xl font-black text-white leading-none tracking-tight">
                    {formatCurrency(totalOwed, currency)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {overdueCount > 0 && (
                    <div className="bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      <span className="text-[10px] font-black text-rose-500 uppercase">{overdueCount} Overdue</span>
                    </div>
                  )}
                  <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{payables.length} Accounts</span>
                  </div>
                </div>
              </div>

              {/* Strategy Switcher */}
              <div className="mt-8 space-y-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Strategy</p>
                <div className="flex p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
                  {[
                    { id: 'urgency', label: 'Urgency', icon: Zap },
                    { id: 'snowball', label: 'Snowball', icon: TrendingDown },
                    { id: 'avalanche', label: 'Avalanche', icon: Sparkles }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setStrategy(tab.id as any)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                          strategy === tab.id ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {payables.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">All Clear!</h3>
                    <p className="text-sm font-bold text-zinc-500 mt-2">You don't owe money on any active accounts.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedPayables.map((debt, index) => {
                    const balance = debt.amount - debt.paidAmount;
                    const daysUntil = getDaysUntilDue(debt.dueDate);
                    const isOverdue = daysUntil < 0;
                    const isTop = index === 0;

                    return (
                      <div key={debt.id} className={`group relative p-5 rounded-3xl border transition-all ${isTop ? 'bg-zinc-900 border-amber-500/30' : 'bg-zinc-950 border-zinc-900'}`}>
                        {isTop && (
                          <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-400 text-zinc-950 text-[10px] font-black uppercase rounded-full shadow-lg">
                            Highest Priority
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-4">
                          <div className="min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">#{index + 1} Target</span>
                              <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-zinc-500'}`} />
                            </div>
                            <h4 className="text-lg font-black truncate">{debt.contact.name}</h4>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{debt.title || 'Personal Loan'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-white">{formatCurrency(balance, currency)}</p>
                            <p className={`text-[10px] font-black uppercase ${isOverdue ? 'text-rose-500' : 'text-zinc-500'}`}>
                              {isOverdue ? `${Math.abs(daysUntil)}d Overdue` : `${daysUntil}d Left`}
                            </p>
                          </div>
                        </div>

                        {/* Analysis Note */}
                        {debt.priorityReason && (
                          <div className="mb-4 p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                            <p className="text-[11px] font-bold text-zinc-400 leading-relaxed italic">
                              "{debt.priorityReason}"
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { onClose(); onViewDetails(debt); }}
                            className="flex-1 py-3 rounded-2xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest border border-zinc-800 active:scale-95 transition-transform"
                          >
                            Analyze
                          </button>
                          <button
                            onClick={() => { onClose(); onRecordPayment(debt); }}
                            className="flex-1 py-3 rounded-2xl bg-white text-zinc-950 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 bg-zinc-900 border-t border-zinc-800 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-zinc-800 text-white font-black active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
