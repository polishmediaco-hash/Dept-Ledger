import React, { useState } from 'react';
import { DebtItem } from '../types';
import { formatCurrency, getDaysUntilDue, getDaysElapsed } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Briefcase, 
  Scale, 
  Plus
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
  onQuickSettle,
  onSelectDebt,
  onOpenAddModal,
}) => {
  const [activeTab, setActiveTab] = useState<'both' | 'i_owe' | 'owed_to_me'>('both');

  const activeDebts = debts.filter(d => (d.amount - d.paidAmount) > 0.001);

  // Column 1: I OWE (Payables)
  const iOweDebts = activeDebts.filter(d => d.direction === 'i_owe');
  const iOwePersonal = iOweDebts.filter(d => d.category === 'personal');
  const iOweBusiness = iOweDebts.filter(d => d.category === 'business');

  const totalIOwePersonal = iOwePersonal.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalIOweBusiness = iOweBusiness.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalIOwe = totalIOwePersonal + totalIOweBusiness;

  // Column 2: OWED TO ME (Receivables)
  const owedToMeDebts = activeDebts.filter(d => d.direction === 'owed_to_me');
  const owedToMePersonal = owedToMeDebts.filter(d => d.category === 'personal');
  const owedToMeBusiness = owedToMeDebts.filter(d => d.category === 'business');

  const totalOwedToMePersonal = owedToMePersonal.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalOwedToMeBusiness = owedToMeBusiness.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalOwedToMe = totalOwedToMePersonal + totalOwedToMeBusiness;

  const netBalance = totalOwedToMe - totalIOwe;

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
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black leading-tight">Full Balance</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Position Overview</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Position Summary Area */}
            <div className="px-6 py-6 bg-zinc-900 shrink-0">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-rose-950/30 border border-rose-900/40 p-4 rounded-3xl space-y-1">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">I Owe</span>
                  <span className="text-sm font-black text-rose-100">{formatCurrency(totalIOwe, currency)}</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-900/40 p-4 rounded-3xl space-y-1">
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Owed to Me</span>
                  <span className="text-sm font-black text-emerald-100">{formatCurrency(totalOwedToMe, currency)}</span>
                </div>
                <div className={`p-4 rounded-3xl border space-y-1 ${netBalance >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Net Position</span>
                  <span className={`text-sm font-black ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {netBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netBalance), currency)}
                  </span>
                </div>
              </div>

              {/* View Switcher */}
              <div className="mt-6 flex p-1 bg-zinc-950 rounded-2xl border border-zinc-800">
                {[
                  { id: 'both', label: 'Overview' },
                  { id: 'i_owe', label: 'I Owe' },
                  { id: 'owed_to_me', label: 'Owed' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${
                      activeTab === tab.id ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              
              {/* Payables Column */}
              {(activeTab === 'both' || activeTab === 'i_owe') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Payables (I Owe)</h3>
                  </div>
                  
                  {/* Personal Section */}
                  {iOwePersonal.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>Personal Records</span>
                        <span>{formatCurrency(totalIOwePersonal, currency)}</span>
                      </div>
                      <div className="space-y-2">
                        {iOwePersonal.map(debt => (
                          <div key={debt.id} onClick={() => onSelectDebt(debt)} className="bg-zinc-900 rounded-2xl p-4 flex items-center justify-between border border-zinc-800 active:scale-95 transition-transform">
                            <div className="min-w-0 pr-4">
                              <h4 className="text-sm font-bold truncate">{debt.contact.name}</h4>
                              <p className="text-[10px] font-bold text-zinc-500 truncate">{debt.title || 'General'}</p>
                            </div>
                            <span className="text-sm font-black text-rose-400 shrink-0">{formatCurrency(debt.amount - debt.paidAmount, currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Section */}
                  {iOweBusiness.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>Business Records</span>
                        <span>{formatCurrency(totalIOweBusiness, currency)}</span>
                      </div>
                      <div className="space-y-2">
                        {iOweBusiness.map(debt => (
                          <div key={debt.id} onClick={() => onSelectDebt(debt)} className="bg-zinc-900 rounded-2xl p-4 flex items-center justify-between border border-zinc-800 active:scale-95 transition-transform">
                            <div className="min-w-0 pr-4">
                              <h4 className="text-sm font-bold truncate">{debt.contact.name}</h4>
                              <p className="text-[10px] font-bold text-zinc-500 truncate">{debt.title || 'Vendor Invoice'}</p>
                            </div>
                            <span className="text-sm font-black text-rose-400 shrink-0">{formatCurrency(debt.amount - debt.paidAmount, currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Receivables Column */}
              {(activeTab === 'both' || activeTab === 'owed_to_me') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-black uppercase tracking-widest">Receivables (Owed)</h3>
                  </div>
                  
                  {/* Personal Section */}
                  {owedToMePersonal.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>Personal Records</span>
                        <span>{formatCurrency(totalOwedToMePersonal, currency)}</span>
                      </div>
                      <div className="space-y-2">
                        {owedToMePersonal.map(debt => (
                          <div key={debt.id} onClick={() => onSelectDebt(debt)} className="bg-zinc-900 rounded-2xl p-4 flex items-center justify-between border border-zinc-800 active:scale-95 transition-transform">
                            <div className="min-w-0 pr-4">
                              <h4 className="text-sm font-bold truncate">{debt.contact.name}</h4>
                              <p className="text-[10px] font-bold text-zinc-500 truncate">{debt.title || 'Personal Loan'}</p>
                            </div>
                            <span className="text-sm font-black text-emerald-400 shrink-0">{formatCurrency(debt.amount - debt.paidAmount, currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Business Section */}
                  {owedToMeBusiness.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>Business Records</span>
                        <span>{formatCurrency(totalOwedToMeBusiness, currency)}</span>
                      </div>
                      <div className="space-y-2">
                        {owedToMeBusiness.map(debt => (
                          <div key={debt.id} onClick={() => onSelectDebt(debt)} className="bg-zinc-900 rounded-2xl p-4 flex items-center justify-between border border-zinc-800 active:scale-95 transition-transform">
                            <div className="min-w-0 pr-4">
                              <h4 className="text-sm font-bold truncate">{debt.contact.name}</h4>
                              <p className="text-[10px] font-bold text-zinc-500 truncate">{debt.title || 'Client Debt'}</p>
                            </div>
                            <span className="text-sm font-black text-emerald-400 shrink-0">{formatCurrency(debt.amount - debt.paidAmount, currency)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            <div className="p-6 bg-zinc-900 border-t border-zinc-800 flex gap-3 shrink-0">
              <button
                onClick={onOpenAddModal}
                className="flex-1 py-4 rounded-2xl bg-zinc-800 text-white font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> New Record
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-white text-zinc-950 font-bold shadow-lg active:scale-95 transition-transform"
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
