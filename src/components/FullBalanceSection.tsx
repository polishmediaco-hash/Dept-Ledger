import React, { useState, useMemo } from 'react';
import { DebtItem, TransactionType } from '../types';
import { formatCurrency, formatDeadlineStatus } from '../utils/dateUtils';
import { BalanceMonthlyChart } from './BalanceMonthlyChart';
import { BalanceCalendarView } from './BalanceCalendarView';
import { 
  Users,
  Calendar,
  BarChart3,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  MinusCircle
} from 'lucide-react';

interface FullBalanceSectionProps {
  debts: DebtItem[];
  currency: string;
  onQuickSettle: (debt: DebtItem) => void;
  onSelectDebt: (debt: DebtItem) => void;
  onOpenAddModal: () => void;
  onRecordPayment?: (debt: DebtItem, mode?: TransactionType) => void;
}

export const FullBalanceSection: React.FC<FullBalanceSectionProps> = ({
  debts,
  currency,
  onQuickSettle,
  onSelectDebt,
  onOpenAddModal,
  onRecordPayment,
}) => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'cashflow' | 'calendar'>('contacts');
  const [contactSearch, setContactSearch] = useState('');
  const [expandedContacts, setExpandedContacts] = useState<Record<string, boolean>>({});

  const activeDebts = useMemo(() => {
    return debts.filter(d => (d.amount - d.paidAmount) > 0.001);
  }, [debts]);

  // Aggregate by contact
  const contactAggregates = useMemo(() => {
    const map = new Map<string, {
      name: string;
      totalOwedToMe: number;
      totalIOwe: number;
      net: number;
      debts: DebtItem[];
    }>();

    activeDebts.forEach(debt => {
      const key = debt.contact.name.trim().toLowerCase();
      const balance = debt.amount - debt.paidAmount;
      if (!map.has(key)) {
        map.set(key, {
          name: debt.contact.name.trim(),
          totalOwedToMe: 0,
          totalIOwe: 0,
          net: 0,
          debts: []
        });
      }
      const item = map.get(key)!;
      item.debts.push(debt);
      if (debt.direction === 'owed_to_me') {
        item.totalOwedToMe += balance;
      } else {
        item.totalIOwe += balance;
      }
      item.net = item.totalOwedToMe - item.totalIOwe;
    });

    let list = Array.from(map.values()).sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
    if (contactSearch.trim()) {
      const q = contactSearch.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    return list;
  }, [activeDebts, contactSearch]);

  const toggleContact = (name: string) => {
    setExpandedContacts(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Main View Selector Tabs (3 clear distinct analysis views) */}
      <div className="flex items-center bg-zinc-100/90 dark:bg-zinc-800/80 p-1 rounded-xl gap-1 border border-zinc-200/80 dark:border-zinc-700/80">
        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>By Person ({contactAggregates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cashflow')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'cashflow'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Cashflow</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Due Dates</span>
        </button>
      </div>

      {/* Tab 1: Aggregated By Contact (Default & Primary) */}
      {activeTab === 'contacts' && (
        <div className="space-y-3">
          {/* Contact Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by contact name..."
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 font-medium"
            />
          </div>

          {contactAggregates.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 dark:text-zinc-500 text-xs">
              No active contacts found.
            </div>
          ) : (
            <div className="space-y-2">
              {contactAggregates.map(c => {
                const isExpanded = !!expandedContacts[c.name];
                return (
                  <div
                    key={c.name}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs transition-all"
                  >
                    <div
                      onClick={() => toggleContact(c.name)}
                      className="p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-zinc-200/80 dark:border-zinc-700">
                          {c.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                            {c.debts.length} active record{c.debts.length > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-2.5">
                        <div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                            {formatCurrency(Math.abs(c.net), currency)}
                          </div>
                          <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                            {c.net > 0 ? (
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Owes you</span>
                            ) : c.net < 0 ? (
                              <span className="text-rose-700 dark:text-rose-400 font-semibold">You owe</span>
                            ) : (
                              'Settled'
                            )}
                          </div>
                        </div>
                        <div className="text-zinc-400 dark:text-zinc-500">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Debts List for this contact */}
                    {isExpanded && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-100 dark:border-zinc-800 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/50">
                        {c.debts.map(d => {
                          const remaining = d.amount - d.paidAmount;
                          const isOwedToMe = d.direction === 'owed_to_me';
                          const deadline = formatDeadlineStatus(d.dueDate, remaining <= 0);

                          return (
                            <div
                              key={d.id}
                              onClick={() => onSelectDebt(d)}
                              className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 rounded-xl flex items-center justify-between gap-2 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isOwedToMe ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                  <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                                    {d.title || (d.category === 'personal' ? 'Personal' : 'Business')}
                                  </span>
                                  {deadline.label && (
                                    <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded-md ${deadline.urgencyClass}`}>
                                      {deadline.label}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                  {isOwedToMe ? 'Owed to you' : 'You owe'}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 tabular-nums mr-1">
                                  {formatCurrency(remaining, currency)}
                                </span>
                                {onRecordPayment && (
                                  <>
                                    <button
                                      onClick={() => onRecordPayment(d, 'add')}
                                      title="Add to debt"
                                      className="py-1 px-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-[11px] font-semibold border border-zinc-200/80 dark:border-zinc-700 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                                    >
                                      <Plus className="w-3 h-3 text-zinc-400" />
                                      <span>Add</span>
                                    </button>
                                    <button
                                      onClick={() => onRecordPayment(d, 'subtract')}
                                      title="Record payment"
                                      className="py-1 px-3 bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 rounded-lg text-[11px] font-bold transition-all active:scale-95 shadow-2xs cursor-pointer flex items-center gap-1"
                                    >
                                      <span>Pay</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Monthly Cashflow */}
      {activeTab === 'cashflow' && (
        <BalanceMonthlyChart 
          debts={activeDebts} 
          currency={currency} 
        />
      )}

      {/* Tab 3: Due Date Calendar View */}
      {activeTab === 'calendar' && (
        <BalanceCalendarView
          debts={activeDebts}
          currency={currency}
          onSelectDebt={onSelectDebt}
          onQuickSettle={onQuickSettle}
        />
      )}
    </div>
  );
};
