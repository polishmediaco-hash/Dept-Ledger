import React, { useState, useMemo } from 'react';
import { DebtItem } from '../types';
import { formatCurrency, formatDeadlineStatus, formatDate } from '../utils/dateUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus 
} from 'lucide-react';

interface BalanceCalendarViewProps {
  debts: DebtItem[];
  currency: string;
  onSelectDebt: (debt: DebtItem) => void;
  onQuickSettle: (debt: DebtItem) => void;
}

export const BalanceCalendarView: React.FC<BalanceCalendarViewProps> = ({
  debts,
  currency,
  onSelectDebt,
  onQuickSettle,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  const activeDebts = useMemo(() => {
    return debts.filter(d => (d.amount - d.paidAmount) > 0.001);
  }, [debts]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayString(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayString(null);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setSelectedDayString(todayStr);
  };

  // Calendar days generation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Next month padding to fill grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    return days;
  }, [year, month]);

  // Map dates to debts
  const debtsByDate = useMemo(() => {
    const map = new Map<string, { owedToMe: DebtItem[]; iOwe: DebtItem[] }>();

    activeDebts.forEach(d => {
      if (!d.dueDate) return;
      if (!map.has(d.dueDate)) {
        map.set(d.dueDate, { owedToMe: [], iOwe: [] });
      }
      const entry = map.get(d.dueDate)!;
      if (d.direction === 'owed_to_me') {
        entry.owedToMe.push(d);
      } else {
        entry.iOwe.push(d);
      }
    });

    return map;
  }, [activeDebts]);

  // Debts to display in the list below calendar
  const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  
  const displayedDebts = useMemo(() => {
    if (selectedDayString) {
      return activeDebts.filter(d => d.dueDate === selectedDayString);
    }
    // Default to all debts due in current viewing month, or all upcoming
    const monthDebts = activeDebts.filter(d => d.dueDate && d.dueDate.startsWith(currentMonthPrefix));
    if (monthDebts.length > 0) return monthDebts;
    return activeDebts.slice(0, 5);
  }, [activeDebts, selectedDayString, currentMonthPrefix]);

  const monthLabel = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div className="space-y-3">
      {/* Calendar Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs transition-colors">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 capitalize">
              {monthLabel}
            </h2>
            <button
              onClick={handleToday}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, idx) => {
            const hasDebts = debtsByDate.has(cell.dateStr);
            const debtData = debtsByDate.get(cell.dateStr);
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDayString;

            return (
              <button
                key={idx}
                onClick={() => {
                  if (isSelected) {
                    setSelectedDayString(null);
                  } else {
                    setSelectedDayString(cell.dateStr);
                  }
                }}
                className={`relative min-h-[44px] flex flex-col items-center justify-start p-1 rounded-xl transition-all cursor-pointer ${
                  !cell.isCurrentMonth ? 'opacity-30' : ''
                } ${
                  isSelected 
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-2xs' 
                    : isToday 
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 font-bold' 
                    : hasDebts
                    ? 'bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold text-zinc-900 dark:text-zinc-100'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <span className="text-[11px] leading-tight mt-0.5">
                  {cell.dayNum}
                </span>

                {/* Due markers / dots */}
                {hasDebts && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {debtData?.owedToMe.length ? (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-emerald-300 dark:bg-emerald-700' : 'bg-emerald-500'}`} />
                    ) : null}
                    {debtData?.iOwe.length ? (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-rose-300 dark:bg-rose-700' : 'bg-rose-500'}`} />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Receivable Due Date</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Payable Due Date</span>
          </div>
        </div>
      </div>

      {/* Selected / Scheduled Debts List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
            <span>
              {selectedDayString ? `Due on ${formatDate(selectedDayString)}` : `Debts Scheduled in ${monthLabel}`}
            </span>
          </div>
          {selectedDayString && (
            <button
              onClick={() => setSelectedDayString(null)}
              className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 font-semibold underline cursor-pointer"
            >
              Show all month
            </button>
          )}
        </div>

        {displayedDebts.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 dark:text-zinc-500 text-xs">
            No debt deadlines recorded for {selectedDayString ? formatDate(selectedDayString) : monthLabel}.
          </div>
        ) : (
          <div className="space-y-2">
            {displayedDebts.map(debt => {
              const remaining = debt.amount - debt.paidAmount;
              const isOwedToMe = debt.direction === 'owed_to_me';
              const deadline = formatDeadlineStatus(debt.dueDate, remaining <= 0);
              const initials = debt.contact.name ? debt.contact.name.slice(0, 2).toUpperCase() : '??';

              return (
                <div
                  key={debt.id}
                  onClick={() => onSelectDebt(debt)}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs flex items-center justify-center shrink-0 border border-zinc-200/80 dark:border-zinc-700">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                          {debt.contact.name}
                        </span>
                        {deadline.label && (
                          <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded-md ${deadline.urgencyClass}`}>
                            {deadline.label}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                        <span>{debt.title || (debt.category === 'personal' ? 'Personal' : 'Business')}</span>
                        <span>•</span>
                        <span className={isOwedToMe ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-rose-700 dark:text-rose-400 font-semibold'}>
                          {isOwedToMe ? 'Owed to you' : 'You owe'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2.5">
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {formatCurrency(remaining, currency)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickSettle(debt);
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
    </div>
  );
};
