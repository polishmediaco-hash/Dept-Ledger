import React, { useState, useMemo } from 'react';
import { DebtItem } from '../types';
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
  Columns,
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
  const [activeTab, setActiveTab] = useState<'cashflow' | 'calendar' | 'contacts' | 'columns'>('cashflow');
  const [contactSearch, setContactSearch] = useState('');
  const [expandedContacts, setExpandedContacts] = useState<Record<string, boolean>>({});

  const activeDebts = useMemo(() => {
    return debts.filter(d => (d.amount - d.paidAmount) > 0.001);
  }, [debts]);

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

  // Ratio bar calculation
  const totalVolume = totalOwedToMe + totalIOwe;
  const receivablePercent = totalVolume > 0 ? (totalOwedToMe / totalVolume) * 100 : 50;

  return (
    <div className="space-y-3 mb-6">
      {/* Top Hero Net Position Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs transition-colors">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-[10px] uppercase font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider block mb-0.5">
              Net Financial Position
            </span>
            <div className={`text-2xl font-bold tabular-nums tracking-tight whitespace-nowrap ${
              netBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
            }`}>
              <span className="mr-1 font-semibold">{netBalance >= 0 ? '+' : '−'}</span>
              <span>{formatCurrency(Math.abs(netBalance), currency)}</span>
            </div>
          </div>

          <div className="text-right">
            <span className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md ${
              netBalance >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
            }`}>
              {netBalance >= 0 ? 'Surplus (+)' : 'Deficit (–)'}
            </span>
          </div>
        </div>

        {/* Balance Ratio Bar */}
        <div className="space-y-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${receivablePercent}%` }}
            />
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-500" 
              style={{ width: `${100 - receivablePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Owed to You:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatCurrency(totalOwedToMe, currency)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">You Owe:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatCurrency(totalIOwe, currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main View Selector Tabs */}
      <div className="flex items-center bg-zinc-100/90 dark:bg-zinc-800/80 p-1 rounded-xl gap-1 border border-zinc-200/80 dark:border-zinc-700/80">
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
          <span>Calendar</span>
        </button>

        <button
          onClick={() => setActiveTab('contacts')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'contacts'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>By Person</span>
        </button>

        <button
          onClick={() => setActiveTab('columns')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'columns'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Columns</span>
        </button>
      </div>

      {/* Tab 1: Monthly Cashflow */}
      {activeTab === 'cashflow' && (
        <BalanceMonthlyChart 
          debts={activeDebts} 
          currency={currency} 
        />
      )}

      {/* Tab 2: Due Date Calendar View */}
      {activeTab === 'calendar' && (
        <BalanceCalendarView
          debts={activeDebts}
          currency={currency}
          onSelectDebt={onSelectDebt}
          onQuickSettle={onQuickSettle}
        />
      )}

      {/* Tab 3: Aggregated By Contact */}
      {activeTab === 'contacts' && (
        <div className="space-y-3">
          {/* Contact Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contact by name..."
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

                              <div className="flex items-center gap-2.5 shrink-0">
                                <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 tabular-nums">
                                  {formatCurrency(remaining, currency)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onQuickSettle(d);
                                  }}
                                  className="py-1.5 px-3 bg-zinc-900 dark:bg-zinc-100 active:bg-zinc-800 dark:active:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold rounded-lg text-[11px] flex items-center gap-1 transition-all active:scale-95 shadow-2xs cursor-pointer"
                                >
                                  <Plus className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
                                  <span>Settle</span>
                                </button>
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

      {/* Tab 4: Side-by-Side Overview Columns */}
      {activeTab === 'columns' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Owed to Me (Receivables) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                  Owed to You
                </h3>
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatCurrency(totalOwedToMe, currency)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/70">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">Personal</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatCurrency(totalOwedToMePersonal, currency)}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/70">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">Business</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatCurrency(totalOwedToMeBusiness, currency)}</span>
              </div>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
              {owedToMeDebts.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400 dark:text-zinc-500">No active receivables.</div>
              ) : (
                owedToMeDebts.map(d => (
                  <div
                    key={d.id}
                    onClick={() => onSelectDebt(d)}
                    className="bg-zinc-50/70 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/70 flex items-center justify-between text-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{d.contact.name}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{d.title || 'Personal'}</div>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums shrink-0">
                      {formatCurrency(d.amount - d.paidAmount, currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* You Owe (Payables) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <h3 className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                  You Owe
                </h3>
              </div>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {formatCurrency(totalIOwe, currency)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/70">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">Personal</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatCurrency(totalIOwePersonal, currency)}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/70">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium block">Business</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{formatCurrency(totalIOweBusiness, currency)}</span>
              </div>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-0.5">
              {iOweDebts.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-400 dark:text-zinc-500">No active payables.</div>
              ) : (
                iOweDebts.map(d => (
                  <div
                    key={d.id}
                    onClick={() => onSelectDebt(d)}
                    className="bg-zinc-50/70 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-200/70 dark:border-zinc-700/70 flex items-center justify-between text-xs cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{d.contact.name}</div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{d.title || 'Personal'}</div>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums shrink-0">
                      {formatCurrency(d.amount - d.paidAmount, currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
