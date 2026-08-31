import React, { useState } from 'react';
import { DebtItem } from '../types';
import { formatCurrency, getDaysUntilDue, getDaysElapsed } from '../utils/dateUtils';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Briefcase, 
  CheckCircle2, 
  Scale, 
  Calendar,
  AlertCircle,
  Sparkles,
  Plus
} from 'lucide-react';

interface FullBalanceSectionProps {
  debts: DebtItem[];
  currency: string;
  onQuickSettle: (debt: DebtItem) => void;
  onSelectDebt: (debt: DebtItem) => void;
  onOpenAddModal: () => void;
}

export const FullBalanceSection: React.FC<FullBalanceSectionProps> = ({
  debts,
  currency,
  onQuickSettle,
  onSelectDebt,
  onOpenAddModal,
}) => {
  const [mobileTab, setMobileTab] = useState<'both' | 'i_owe' | 'owed_to_me'>('both');

  const activeDebts = debts.filter(d => (d.amount - d.paidAmount) > 0.001);

  // Column 1: I Owe (Payables)
  const iOweDebts = activeDebts.filter(d => d.direction === 'i_owe');
  const iOwePersonal = iOweDebts.filter(d => d.category === 'personal');
  const iOweBusiness = iOweDebts.filter(d => d.category === 'business');

  const totalIOwePersonal = iOwePersonal.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalIOweBusiness = iOweBusiness.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalIOwe = totalIOwePersonal + totalIOweBusiness;

  // Column 2: Owed to Me (Receivables)
  const owedToMeDebts = activeDebts.filter(d => d.direction === 'owed_to_me');
  const owedToMePersonal = owedToMeDebts.filter(d => d.category === 'personal');
  const owedToMeBusiness = owedToMeDebts.filter(d => d.category === 'business');

  const totalOwedToMePersonal = owedToMePersonal.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalOwedToMeBusiness = owedToMeBusiness.reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  const totalOwedToMe = totalOwedToMePersonal + totalOwedToMeBusiness;

  const netBalance = totalOwedToMe - totalIOwe;

  return (
    <div className="space-y-3 mb-6">
      {/* Title & Top Net Card */}
      <div className="bg-zinc-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-zinc-800 text-emerald-400 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Full Balance (2 Columns)</h2>
              <p className="text-[10px] text-zinc-400">Personal & Business spaces</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block">Net Balance</span>
            <span className={`text-sm font-extrabold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netBalance), currency)}
            </span>
          </div>
        </div>

        {/* 2 Big Totals */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-900/60">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] uppercase font-extrabold text-rose-400">Column 1: I Owe</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-900 text-rose-200">
                {iOweDebts.length}
              </span>
            </div>
            <div className="text-base font-extrabold text-rose-300">
              {formatCurrency(totalIOwe, currency)}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-900/60">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] uppercase font-extrabold text-emerald-400">Column 2: Owed To Me</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-900 text-emerald-200">
                {owedToMeDebts.length}
              </span>
            </div>
            <div className="text-base font-extrabold text-emerald-300">
              {formatCurrency(totalOwedToMe, currency)}
            </div>
          </div>
        </div>

        {/* Segmented control for switching column view on small screens */}
        <div className="flex bg-zinc-800 p-0.5 rounded-xl text-[11px] font-bold">
          <button
            onClick={() => setMobileTab('both')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              mobileTab === 'both' ? 'bg-zinc-700 text-white shadow-xs' : 'text-zinc-400'
            }`}
          >
            All Spaces
          </button>
          <button
            onClick={() => setMobileTab('i_owe')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              mobileTab === 'i_owe' ? 'bg-rose-900 text-rose-100 shadow-xs' : 'text-zinc-400'
            }`}
          >
            I Owe ({iOweDebts.length})
          </button>
          <button
            onClick={() => setMobileTab('owed_to_me')}
            className={`flex-1 py-1 rounded-lg transition-all ${
              mobileTab === 'owed_to_me' ? 'bg-emerald-900 text-emerald-100 shadow-xs' : 'text-zinc-400'
            }`}
          >
            Owed to Me ({owedToMeDebts.length})
          </button>
        </div>
      </div>

      {/* The Two Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* ================= COLUMN 1: I OWE ================= */}
        {(mobileTab === 'both' || mobileTab === 'i_owe') && (
          <div className="bg-white rounded-2xl border border-rose-200/80 p-3.5 space-y-3 shadow-2xs">
            {/* Column 1 Title */}
            <div className="flex items-center justify-between pb-2 border-b border-rose-100">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-md bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-extrabold text-rose-900 uppercase tracking-wider">
                  Column 1: I Owe (Payables)
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-700">{formatCurrency(totalIOwe, currency)}</span>
            </div>

            {/* --- Space 1: Personal --- */}
            <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Personal Space</span>
                  <span className="text-[10px] text-zinc-400 font-normal">({iOwePersonal.length})</span>
                </div>
                <span className="font-extrabold text-rose-700">{formatCurrency(totalIOwePersonal, currency)}</span>
              </div>

              {iOwePersonal.length > 0 ? (
                <div className="space-y-1.5">
                  {iOwePersonal.map((debt) => {
                    const balance = debt.amount - debt.paidAmount;
                    const daysLeft = debt.dueDate ? getDaysUntilDue(debt.dueDate) : null;
                    return (
                      <div
                        key={debt.id}
                        onClick={() => onSelectDebt(debt)}
                        className="p-2 rounded-lg bg-white border border-zinc-200 active:border-zinc-300 flex items-center justify-between gap-2 cursor-pointer transition-colors active:scale-[0.98]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-zinc-900 truncate">{debt.contact.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {debt.title || 'Personal Loan'}
                            {daysLeft !== null && (
                              <span className={`ml-1 ${daysLeft < 0 ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                                • {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `Due in ${daysLeft}d`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold text-rose-700">{formatCurrency(balance, currency)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickSettle(debt);
                            }}
                            className="px-2 py-1 rounded bg-zinc-100 active:bg-emerald-100 active:text-emerald-800 text-[10px] font-bold text-zinc-700 transition-colors active:scale-95"
                          >
                            Settle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400 py-1 text-center">No personal payables.</p>
              )}
            </div>

            {/* --- Space 2: Business --- */}
            <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  <span>Business Space</span>
                  <span className="text-[10px] text-zinc-400 font-normal">({iOweBusiness.length})</span>
                </div>
                <span className="font-extrabold text-rose-700">{formatCurrency(totalIOweBusiness, currency)}</span>
              </div>

              {iOweBusiness.length > 0 ? (
                <div className="space-y-1.5">
                  {iOweBusiness.map((debt) => {
                    const balance = debt.amount - debt.paidAmount;
                    const daysLeft = debt.dueDate ? getDaysUntilDue(debt.dueDate) : null;
                    return (
                      <div
                        key={debt.id}
                        onClick={() => onSelectDebt(debt)}
                        className="p-2 rounded-lg bg-white border border-zinc-200 active:border-zinc-300 flex items-center justify-between gap-2 cursor-pointer transition-colors active:scale-[0.98]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-zinc-900 truncate">
                            {debt.contact.name}
                            {debt.contact.company && <span className="text-zinc-500 font-normal ml-1">({debt.contact.company})</span>}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {debt.title || 'Invoice / Service'}
                            {daysLeft !== null && (
                              <span className={`ml-1 ${daysLeft < 0 ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                                • {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `Due in ${daysLeft}d`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold text-rose-700">{formatCurrency(balance, currency)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickSettle(debt);
                            }}
                            className="px-2 py-1 rounded bg-zinc-100 active:bg-emerald-100 active:text-emerald-800 text-[10px] font-bold text-zinc-700 transition-colors active:scale-95"
                          >
                            Settle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400 py-1 text-center">No business payables.</p>
              )}
            </div>

          </div>
        )}

        {/* ================= COLUMN 2: OWED TO ME ================= */}
        {(mobileTab === 'both' || mobileTab === 'owed_to_me') && (
          <div className="bg-white rounded-2xl border border-emerald-200/80 p-3.5 space-y-3 shadow-2xs">
            {/* Column 2 Title */}
            <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
              <div className="flex items-center gap-1.5">
                <div className="h-6 w-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                  Column 2: Owed To Me (Receivables)
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700">{formatCurrency(totalOwedToMe, currency)}</span>
            </div>

            {/* --- Space 1: Personal --- */}
            <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Personal Space</span>
                  <span className="text-[10px] text-zinc-400 font-normal">({owedToMePersonal.length})</span>
                </div>
                <span className="font-extrabold text-emerald-700">{formatCurrency(totalOwedToMePersonal, currency)}</span>
              </div>

              {owedToMePersonal.length > 0 ? (
                <div className="space-y-1.5">
                  {owedToMePersonal.map((debt) => {
                    const balance = debt.amount - debt.paidAmount;
                    const daysLeft = debt.dueDate ? getDaysUntilDue(debt.dueDate) : null;
                    return (
                      <div
                        key={debt.id}
                        onClick={() => onSelectDebt(debt)}
                        className="p-2 rounded-lg bg-white border border-zinc-200 active:border-zinc-300 flex items-center justify-between gap-2 cursor-pointer transition-colors active:scale-[0.98]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-zinc-900 truncate">{debt.contact.name}</div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {debt.title || 'Personal Loan'}
                            {daysLeft !== null && (
                              <span className={`ml-1 ${daysLeft < 0 ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                                • {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `Due in ${daysLeft}d`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold text-emerald-700">{formatCurrency(balance, currency)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickSettle(debt);
                            }}
                            className="px-2 py-1 rounded bg-zinc-100 active:bg-emerald-100 active:text-emerald-800 text-[10px] font-bold text-zinc-700 transition-colors active:scale-95"
                          >
                            Settle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400 py-1 text-center">No personal receivables.</p>
              )}
            </div>

            {/* --- Space 2: Business --- */}
            <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-zinc-800">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                  <span>Business Space</span>
                  <span className="text-[10px] text-zinc-400 font-normal">({owedToMeBusiness.length})</span>
                </div>
                <span className="font-extrabold text-emerald-700">{formatCurrency(totalOwedToMeBusiness, currency)}</span>
              </div>

              {owedToMeBusiness.length > 0 ? (
                <div className="space-y-1.5">
                  {owedToMeBusiness.map((debt) => {
                    const balance = debt.amount - debt.paidAmount;
                    const daysLeft = debt.dueDate ? getDaysUntilDue(debt.dueDate) : null;
                    return (
                      <div
                        key={debt.id}
                        onClick={() => onSelectDebt(debt)}
                        className="p-2 rounded-lg bg-white border border-zinc-200 active:border-zinc-300 flex items-center justify-between gap-2 cursor-pointer transition-colors active:scale-[0.98]"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-zinc-900 truncate">
                            {debt.contact.name}
                            {debt.contact.company && <span className="text-zinc-500 font-normal ml-1">({debt.contact.company})</span>}
                          </div>
                          <div className="text-[10px] text-zinc-500 truncate">
                            {debt.title || 'Client Invoice'}
                            {daysLeft !== null && (
                              <span className={`ml-1 ${daysLeft < 0 ? 'text-rose-600 font-bold' : 'text-zinc-400'}`}>
                                • {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `Due in ${daysLeft}d`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold text-emerald-700">{formatCurrency(balance, currency)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuickSettle(debt);
                            }}
                            className="px-2 py-1 rounded bg-zinc-100 active:bg-emerald-100 active:text-emerald-800 text-[10px] font-bold text-zinc-700 transition-colors active:scale-95"
                          >
                            Settle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-400 py-1 text-center">No business receivables.</p>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
