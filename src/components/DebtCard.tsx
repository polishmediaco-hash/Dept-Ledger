import React, { useState } from 'react';
import { DebtItem } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDurationElapsed, 
  formatDeadlineStatus, 
  getDebtStatus,
} from '../utils/dateUtils';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  MessageSquare, 
  Phone, 
  Mail, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  PlusCircle,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

interface DebtCardProps {
  debt: DebtItem;
  currency: string;
  onRecordPayment: (debt: DebtItem) => void;
  onViewDetails: (debt: DebtItem) => void;
  onEditDebt: (debt: DebtItem) => void;
  onDeleteDebt: (debtId: string) => void;
  onQuickSettle: (debt: DebtItem) => void;
  onOpenReminder: (debt: DebtItem) => void;
}

export const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  currency,
  onRecordPayment,
  onViewDetails,
  onEditDebt,
  onDeleteDebt,
  onQuickSettle,
  onOpenReminder,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const balance = Math.max(0, debt.amount - debt.paidAmount);
  const isSettled = balance <= 0.001;
  const deadlineInfo = formatDeadlineStatus(debt.dueDate, isSettled);
  const durationText = formatDurationElapsed(debt.startDate);
  const percentPaid = Math.min(100, Math.round((debt.paidAmount / debt.amount) * 100)) || 0;
  const isOwedToMe = debt.direction === 'owed_to_me';

  const copyToClipboard = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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
      className={`bg-white rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden active:scale-[0.98] active:shadow-inner ${
        isSettled
          ? 'border-zinc-200/70 bg-zinc-50/40 opacity-75'
          : deadlineInfo.isOverdue
          ? 'border-rose-300 ring-1 ring-rose-100'
          : 'border-zinc-200/90'
      }`}
    >
      {/* Direction & Status top bar indicator */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Category & Priority badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                isOwedToMe
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                  : 'bg-rose-50 text-rose-700 border border-rose-200/80'
              }`}>
                {isOwedToMe ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                <span>{isOwedToMe ? 'Owed to Me' : 'I Owe'}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">
                {debt.category === 'personal' ? (
                  <User className="w-3 h-3 text-zinc-400" />
                ) : (
                  <Briefcase className="w-3 h-3 text-zinc-400" />
                )}
                <span className="capitalize">{debt.category}</span>
              </span>
            </div>

            {/* Priority Tag */}
            {!isSettled && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md capitalize ${
                debt.priority === 'urgent'
                  ? 'bg-rose-100 text-rose-800'
                  : debt.priority === 'high'
                  ? 'bg-amber-100 text-amber-800'
                  : debt.priority === 'medium'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-zinc-100 text-zinc-600'
              }`}>
                {debt.priority}
              </span>
            )}
          </div>

          {/* Contact Avatar & Name */}
          <div className="flex items-start gap-3 mb-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
              isSettled
                ? 'bg-zinc-200 text-zinc-600'
                : isOwedToMe
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-zinc-900 text-sm tracking-tight truncate">
                {debt.contact.name}
              </h4>
              <p className="text-xs text-zinc-500 truncate">
                {debt.title || (debt.category === 'personal' ? 'Personal loan' : 'Business payable')}
              </p>
            </div>
          </div>

          {/* Balance & Amount */}
          <div className="bg-zinc-50/80 rounded-xl p-3 border border-zinc-100 mb-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                {isSettled ? 'Settled' : 'Remaining Balance'}
              </span>
              <span className="text-xs text-zinc-400">
                Total: {formatCurrency(debt.amount, currency)}
              </span>
            </div>

            <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 mt-0.5 flex flex-wrap items-baseline gap-x-1">
              {isSettled ? (
                <span className="text-emerald-700 flex items-center gap-1.5 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Paid in full</span>
                </span>
              ) : (
                <span className={`${isOwedToMe ? 'text-emerald-700' : 'text-zinc-900'} break-all`}>
                  {formatCurrency(balance, currency)}
                </span>
              )}
            </div>

            {/* Repayment progress bar */}
            {!isSettled && debt.paidAmount > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                  <span>Paid: {formatCurrency(debt.paidAmount, currency)} ({percentPaid}%)</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Aging & Deadline Tags */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-600 mb-2">
            {/* Aging Duration */}
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600" title="How long this money has been owed">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>Owed for {durationText}</span>
            </span>

            {/* Deadline status */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
              deadlineInfo.isOverdue
                ? 'bg-rose-100 text-rose-800'
                : isSettled
                ? 'bg-zinc-100 text-zinc-500'
                : 'bg-zinc-100 text-zinc-700'
            }`}>
              <Calendar className="w-3 h-3" />
              <span>{deadlineInfo.label}</span>
            </span>
          </div>

          {/* Contact Handle / Payment details preview if available */}
          {debt.contact.paymentDetails && (
            <div 
              onClick={(e) => copyToClipboard(debt.contact.paymentDetails!, 'pay', e)}
              className="flex items-center justify-between text-[11px] bg-zinc-100/70 active:bg-zinc-200 px-2.5 py-1 rounded-lg text-zinc-600 transition-colors cursor-pointer mb-2"
              title="Click to copy payment handle"
            >
              <div className="flex items-center gap-1.5 truncate">
                <CreditCard className="w-3 h-3 text-zinc-400 shrink-0" />
                <span className="truncate font-mono">{debt.contact.paymentDetails}</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-0.5 ml-2 shrink-0">
                {copiedKey === 'pay' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'pay' ? 'Copied' : 'Copy'}</span>
              </span>
            </div>
          )}
        </div>

        {/* Quick Action Footer */}
        <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
          {/* Main Action: + Record Payment */}
          {!isSettled ? (
            <button
              type="button"
              onClick={() => onRecordPayment(debt)}
              className="flex-1 py-1.5 px-2.5 bg-zinc-900 active:bg-zinc-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all active:scale-95 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Record Pay</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onQuickSettle(debt)}
              className="flex-1 py-1.5 px-2.5 bg-zinc-100 active:bg-zinc-200 text-zinc-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen</span>
            </button>
          )}

          {/* Quick Settle / Check button */}
          {!isSettled && (
            <button
              type="button"
              onClick={() => onQuickSettle(debt)}
              className="p-1.5 rounded-xl border border-zinc-200 active:bg-emerald-50 active:border-emerald-300 active:text-emerald-700 text-zinc-500 transition-colors active:scale-95"
              title="Mark settled in full"
            >
              <Check className="w-4 h-4" />
            </button>
          )}

          {/* Reminder Generator (for receivables) */}
          {isOwedToMe && !isSettled && (
            <button
              type="button"
              onClick={() => onOpenReminder(debt)}
              className="p-1.5 rounded-xl border border-zinc-200 active:bg-zinc-100 text-zinc-600 transition-colors active:scale-95"
              title="Send Payment Reminder"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}

          {/* Edit */}
          <button
            type="button"
            onClick={() => onEditDebt(debt)}
            className="p-1.5 rounded-xl border border-zinc-200 active:bg-zinc-100 text-zinc-600 transition-colors active:scale-95"
            title="Edit Record"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDeleteDebt(debt.id)}
            className="p-1.5 rounded-xl border border-zinc-200 active:bg-rose-50 active:border-rose-200 active:text-rose-700 text-zinc-400 transition-colors active:scale-95"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
