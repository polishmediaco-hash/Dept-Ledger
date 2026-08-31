import React from 'react';
import { DebtItem } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDurationElapsed, 
  formatDeadlineStatus, 
  getDebtStatus 
} from '../utils/dateUtils';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Briefcase, 
  CreditCard, 
  MessageSquare, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle2 
} from 'lucide-react';

interface DebtTableViewProps {
  debts: DebtItem[];
  currency: string;
  onRecordPayment: (debt: DebtItem) => void;
  onViewDetails: (debt: DebtItem) => void;
  onEditDebt: (debt: DebtItem) => void;
  onDeleteDebt: (debtId: string) => void;
  onQuickSettle: (debt: DebtItem) => void;
  onOpenReminder: (debt: DebtItem) => void;
}

export const DebtTableView: React.FC<DebtTableViewProps> = ({
  debts,
  currency,
  onRecordPayment,
  onViewDetails,
  onEditDebt,
  onDeleteDebt,
  onQuickSettle,
  onOpenReminder,
}) => {
  if (debts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Contact & Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 text-right">Balance</th>
              <th className="py-3 px-4">Duration (Owed For)</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {debts.map((debt) => {
              const balance = Math.max(0, debt.amount - debt.paidAmount);
              const isSettled = balance <= 0.001;
              const deadline = formatDeadlineStatus(debt.dueDate, isSettled);
              const duration = formatDurationElapsed(debt.startDate);
              const isOwedToMe = debt.direction === 'owed_to_me';

              return (
                <tr 
                  key={debt.id} 
                  id={`table-row-${debt.id}`}
                  className={`hover:bg-zinc-50/80 transition-colors ${
                    isSettled ? 'bg-zinc-50/40 text-zinc-400' : ''
                  }`}
                >
                  {/* Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[11px] ${
                      isOwedToMe
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {isOwedToMe ? (
                        <>
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                          <span>OWES ME</span>
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-rose-600" />
                          <span>I OWE</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Contact & Title */}
                  <td className="py-3 px-4 min-w-[180px]">
                    <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                      <span>{debt.contact.name || 'Unnamed'}</span>
                      {debt.contact.company && (
                        <span className="text-zinc-500 font-normal text-[11px]">
                          ({debt.contact.company})
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-600 text-[11px] truncate max-w-[220px]">
                      {debt.title}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      {debt.category === 'personal' ? (
                        <>
                          <User className="w-3 h-3 text-zinc-500" />
                          <span>Personal</span>
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-3 h-3 text-zinc-500" />
                          <span>Business</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {!isSettled ? (
                      <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                        debt.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : debt.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : debt.priority === 'medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        <span className="capitalize">{debt.priority}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-medium">Settled</span>
                    )}
                  </td>

                  {/* Balance */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className={`font-bold text-sm ${
                      isSettled
                        ? 'text-zinc-400 line-through'
                        : isOwedToMe
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}>
                      {formatCurrency(balance, currency)}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      of {formatCurrency(debt.amount, currency)}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-zinc-800">{duration}</div>
                    <div className="text-[10px] text-zinc-400">since {formatDate(debt.startDate)}</div>
                  </td>

                  {/* Deadline */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${deadline.urgencyClass}`}>
                      {deadline.label}
                    </span>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {formatDate(debt.dueDate)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {!isSettled && (
                        <button
                          onClick={() => onRecordPayment(debt)}
                          title="Record payment"
                          className="p-1.5 rounded text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      )}

                      {isOwedToMe && !isSettled && (
                        <button
                          onClick={() => onOpenReminder(debt)}
                          title="Generate payment reminder"
                          className="p-1.5 rounded text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => onViewDetails(debt)}
                        title="View details"
                        className="p-1.5 rounded text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditDebt(debt)}
                        title="Edit record"
                        className="p-1.5 rounded text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onQuickSettle(debt)}
                        title={isSettled ? 'Reopen' : 'Mark as settled'}
                        className="p-1.5 rounded text-zinc-600 hover:text-emerald-700 hover:bg-zinc-100 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteDebt(debt.id)}
                        title="Delete"
                        className="p-1.5 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
