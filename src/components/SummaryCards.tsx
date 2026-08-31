import React from 'react';
import { DebtItem } from '../types';
import { formatCurrency, getDaysUntilDue, getPriorityScore } from '../utils/dateUtils';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Scale, 
  AlertCircle, 
  Clock, 
  Briefcase, 
  User, 
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface SummaryCardsProps {
  debts: DebtItem[];
  currency: string;
  onFilterTab: (tab: 'all' | 'owed_to_me' | 'i_owe') => void;
  onOpenPriorityAdvisor: () => void;
  onSelectDebt: (debt: DebtItem) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  debts,
  currency,
  onFilterTab,
  onOpenPriorityAdvisor,
  onSelectDebt,
}) => {
  const activeDebts = debts.filter(d => (d.amount - d.paidAmount) > 0.001);

  // Owed to me (receivables)
  const owedToMeItems = activeDebts.filter(d => d.direction === 'owed_to_me');
  const totalOwedToMe = owedToMeItems.reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);
  const owedToMePersonal = owedToMeItems.filter(d => d.category === 'personal').reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);
  const owedToMeBusiness = owedToMeItems.filter(d => d.category === 'business').reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);

  // I owe (payables)
  const iOweItems = activeDebts.filter(d => d.direction === 'i_owe');
  const totalIOwe = iOweItems.reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);
  const iOwePersonal = iOweItems.filter(d => d.category === 'personal').reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);
  const iOweBusiness = iOweItems.filter(d => d.category === 'business').reduce((acc, d) => acc + (d.amount - d.paidAmount), 0);

  // Net position
  const netPosition = totalOwedToMe - totalIOwe;

  // Overdue and upcoming items
  const overdueItems = activeDebts.filter(d => d.dueDate && getDaysUntilDue(d.dueDate) < 0);

  // Top priority debt I owe to pay next
  const sortedPayables = [...iOweItems].sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
  const topPayable = sortedPayables[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {/* 1. Owed To Me Card */}
      <div 
        id="summary-card-owed-to-me"
        onClick={() => onFilterTab('owed_to_me')}
        className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer hover:border-emerald-300 group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Owed To Me</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
            {owedToMeItems.length} active
          </span>
        </div>

        <div className="text-2xl font-extrabold text-emerald-800 tracking-tight mb-2">
          {formatCurrency(totalOwedToMe, currency)}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
          <span>Personal: <strong className="text-zinc-700">{formatCurrency(owedToMePersonal, currency)}</strong></span>
          <span>Business: <strong className="text-zinc-700">{formatCurrency(owedToMeBusiness, currency)}</strong></span>
        </div>
      </div>

      {/* 2. I Owe Card */}
      <div 
        id="summary-card-i-owe"
        onClick={() => onFilterTab('i_owe')}
        className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer hover:border-rose-300 group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">I Owe</span>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-100">
            {iOweItems.length} active
          </span>
        </div>

        <div className="text-2xl font-extrabold text-rose-800 tracking-tight mb-2">
          {formatCurrency(totalIOwe, currency)}
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-100">
          <span>Personal: <strong className="text-zinc-700">{formatCurrency(iOwePersonal, currency)}</strong></span>
          <span>Business: <strong className="text-zinc-700">{formatCurrency(iOweBusiness, currency)}</strong></span>
        </div>
      </div>

      {/* 3. Net Balance Card */}
      <div 
        id="summary-card-net"
        onClick={() => onFilterTab('all')}
        className="bg-white border border-zinc-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer hover:border-zinc-300"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-zinc-100 text-zinc-700 flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Net Position</span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            netPosition >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {netPosition >= 0 ? 'Surplus' : 'Deficit'}
          </span>
        </div>

        <div className={`text-2xl font-extrabold tracking-tight mb-2 ${
          netPosition >= 0 ? 'text-emerald-700' : 'text-rose-700'
        }`}>
          {netPosition < 0 ? '-' : '+'}{formatCurrency(Math.abs(netPosition), currency)}
        </div>

        <div className="text-[11px] text-zinc-500 pt-2 border-t border-zinc-100 flex items-center justify-between">
          <span>{activeDebts.length} total active</span>
          {overdueItems.length > 0 ? (
            <span className="font-bold text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{overdueItems.length} Overdue</span>
            </span>
          ) : (
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>All on schedule</span>
            </span>
          )}
        </div>
      </div>

      {/* 4. Pay Next / Urgent Advisor Card */}
      <div 
        id="summary-card-advisor"
        onClick={onOpenPriorityAdvisor}
        className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer hover:border-amber-300 relative group"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Pay Next</span>
          </div>
          <span className="text-[11px] font-bold text-amber-700 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            <span>Advisor</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {topPayable ? (
          <div>
            <div className="flex items-baseline justify-between mb-0.5">
              <h4 className="font-bold text-zinc-900 text-sm truncate max-w-[130px]">
                {topPayable.contact.name}
              </h4>
              <span className="text-xs font-bold text-rose-700">
                {formatCurrency(topPayable.amount - topPayable.paidAmount, currency)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 truncate mb-2">
              {topPayable.dueDate ? `Due ${topPayable.dueDate}` : 'Top urgency priority'}
            </p>
            <div className="text-[11px] font-semibold text-amber-800 pt-2 border-t border-zinc-100 flex items-center justify-between">
              <span>Urgency Ranking</span>
              <span className="capitalize text-zinc-600">{topPayable.priority} Priority</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-bold text-zinc-800 mt-1">No debts to pay!</div>
            <p className="text-[11px] text-zinc-500 mt-1 mb-2">You currently have zero pending payables.</p>
            <div className="text-[11px] text-emerald-700 pt-2 border-t border-zinc-100 font-semibold">
              100% Debt Free
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
