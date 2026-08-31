import React, { useState } from 'react';
import { DebtItem, TransactionType } from '../types';
import { 
   formatCurrency, 
   formatDurationElapsed, 
   formatDeadlineStatus, 
 } from '../utils/dateUtils';
import { 
   Calendar, 
   Clock, 
   CheckCircle2, 
   Edit3, 
   Trash2, 
   Plus,
   MinusCircle,
   PlusCircle,
   CreditCard,
   RotateCcw,
   Check,
   MoreHorizontal
 } from 'lucide-react';

interface DebtCardProps {
  debt: DebtItem;
  currency: string;
  onRecordPayment: (debt: DebtItem, mode?: TransactionType) => void;
  onViewDetails: (debt: DebtItem) => void;
  onEditDebt: (debt: DebtItem) => void;
  onDeleteDebt: (debtId: string) => void;
  onQuickSettle: (debt: DebtItem) => void;
}

export const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  currency,
  onRecordPayment,
  onViewDetails,
  onEditDebt,
  onDeleteDebt,
  onQuickSettle,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const balance = Math.max(0, debt.amount - debt.paidAmount);
  const isSettled = balance <= 0.001;
  const deadlineInfo = formatDeadlineStatus(debt.dueDate, isSettled);
  const durationText = formatDurationElapsed(debt.startDate);
  const percentPaid = Math.min(100, Math.round((debt.paidAmount / debt.amount) * 100)) || 0;
  const isOwedToMe = debt.direction === 'owed_to_me';

  // Initials
  const initials = debt.contact.name
    ? debt.contact.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div
      id={`debt-card-${debt.id}`}
      onClick={() => onViewDetails(debt)}
      className={`bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden active:scale-[0.99] relative ${
        isSettled
          ? 'border-zinc-200/70 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 opacity-80'
          : deadlineInfo.isOverdue
          ? 'border-rose-300 dark:border-rose-800/80 ring-1 ring-rose-100 dark:ring-rose-950 shadow-2xs'
          : 'border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      <div className="p-4 flex flex-col justify-between">
        <div>
          {/* Top Row: Contact + Category + Status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-semibold text-xs shrink-0 border ${
                isSettled
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 border-zinc-200/50 dark:border-zinc-700/50'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-700'
              }`}>
                {initials}
              </div>

              <div className="min-w-0">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight truncate">
                  {debt.contact.name}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                  <span>{debt.title || (debt.category === 'personal' ? 'Personal' : 'Business')}</span>
                  <span>•</span>
                  <span className={isOwedToMe ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-rose-700 dark:text-rose-400 font-semibold'}>
                    {isOwedToMe ? 'Owed to you' : 'You owe'}
                  </span>
                </div>
              </div>
            </div>

            {/* Overflow / Actions Menu Toggle */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowMenu(false)} 
                  />
                  <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-1.5 animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onRecordPayment(debt, 'add');
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      <span>Add to Debt (Top up)</span>
                    </button>

                    {!isSettled && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onRecordPayment(debt, 'subtract');
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                        <span>Record Payment</span>
                      </button>
                    )}

                    <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1" />

                    {!isSettled ? (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onQuickSettle(debt);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold theme-rec-text hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Settle in Full</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          onQuickSettle(debt);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen Debt</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEditDebt(debt);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                      <span>Edit Record</span>
                    </button>

                    <div className="h-[1px] bg-zinc-100 dark:bg-zinc-800 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDeleteDebt(debt.id);
                      }}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-zinc-50/70 dark:bg-zinc-800/40 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800/80 mb-2.5">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                {isSettled ? 'Settled' : 'Balance'}
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal tabular-nums">
                Total: {formatCurrency(debt.amount, currency)}
              </span>
            </div>

            <div className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5 tabular-nums">
              {isSettled ? (
                <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Paid in full</span>
                </span>
              ) : (
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                  {formatCurrency(balance, currency)}
                </span>
              )}
            </div>

            {/* Repayment progress bar */}
            {!isSettled && debt.paidAmount > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-normal tabular-nums">
                  <span>Paid {formatCurrency(debt.paidAmount, currency)} ({percentPaid}%)</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full theme-rec-bg rounded-full transition-all duration-300"
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Info Tags */}
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                deadlineInfo.isOverdue
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  : isSettled
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}>
                <Calendar className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                <span>{deadlineInfo.label}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                <span>{durationText}</span>
              </span>
            </div>

            {/* Quick Actions on Card */}
            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
              {!isSettled ? (
                <>
                  <button
                    type="button"
                    onClick={() => onRecordPayment(debt, 'add')}
                    title={isOwedToMe ? "Lent more money (increase debt)" : "Borrowed more money"}
                    className="py-1 px-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-lg text-[11px] flex items-center gap-1 border border-zinc-200/80 dark:border-zinc-700/80 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                    <span>Add</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRecordPayment(debt, 'subtract')}
                    title={isOwedToMe ? "Record payment received" : "Record payment made"}
                    className="py-1 px-3 bg-zinc-950 dark:bg-zinc-100 active:bg-zinc-800 dark:active:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <CreditCard className="w-3 h-3 text-zinc-300 dark:text-zinc-700" />
                    <span>Pay</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-200/60 dark:border-emerald-800/60">
                    ✓ Settled
                  </span>
                  <button
                    type="button"
                    onClick={() => onRecordPayment(debt, 'add')}
                    className="py-1 px-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 font-medium rounded-lg text-[10px] transition-all cursor-pointer"
                  >
                    Reopen
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

