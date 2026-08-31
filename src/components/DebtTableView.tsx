import React from 'react';
import { DebtItem, TransactionType } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDurationElapsed, 
  formatDeadlineStatus, 
} from '../utils/dateUtils';
import { 
  User, 
  Briefcase, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Check, 
  RotateCcw, 
  CreditCard, 
  Plus,
  ExternalLink 
} from 'lucide-react';

interface DebtTableViewProps {
  debts: DebtItem[];
  currency: string;
  onRecordPayment: (debt: DebtItem, mode?: TransactionType) => void;
  onViewDetails: (debt: DebtItem) => void;
  onEditDebt: (debt: DebtItem) => void;
  onDeleteDebt: (debtId: string) => void;
  onQuickSettle: (debt: DebtItem) => void;
}

export const DebtTableView: React.FC<DebtTableViewProps> = ({
  debts,
  currency,
  onRecordPayment,
  onViewDetails,
  onEditDebt,
  onDeleteDebt,
  onQuickSettle,
}) => {
  if (debts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
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
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
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
                  className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors ${
                    isSettled ? 'bg-zinc-50/40 dark:bg-zinc-850/40 text-zinc-400 dark:text-zinc-600' : ''
                  }`}
                >
                  {/* Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-[10px] tracking-tight border ${
                      isOwedToMe
                        ? 'theme-rec-badge'
                        : 'theme-pay-badge'
                    }`}>
                      {isOwedToMe ? '+ OWES ME' : '− I OWE'}
                    </span>
                  </td>

                  {/* Contact & Title */}
                  <td className="py-3 px-4 min-w-[180px]">
                    <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <span>{debt.contact.name || 'Unnamed'}</span>
                      {debt.contact.company && (
                        <span className="text-zinc-500 dark:text-zinc-400 font-normal text-[11px]">
                          ({debt.contact.company})
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-600 dark:text-zinc-400 text-[11px] truncate max-w-[220px]">
                      {debt.title}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      {debt.category === 'personal' ? (
                        <>
                          <User className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                          <span>Personal</span>
                        </>
                      ) : (
                        <>
                          <Briefcase className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
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
                          ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300'
                          : debt.priority === 'high'
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                          : debt.priority === 'medium'
                          ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        <span className="capitalize">{debt.priority}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">Settled</span>
                    )}
                  </td>

                  {/* Balance */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className={`font-bold text-sm ${
                      isSettled
                        ? 'text-zinc-400 dark:text-zinc-600 line-through'
                        : isOwedToMe
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-700 dark:text-rose-400'
                    }`}>
                      {formatCurrency(balance, currency)}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      of {formatCurrency(debt.amount, currency)}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">{duration}</div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500">since {formatDate(debt.startDate)}</div>
                  </td>

                  {/* Deadline */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${deadline.urgencyClass}`}>
                      {deadline.label}
                    </span>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {formatDate(debt.dueDate)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onRecordPayment(debt, 'add')}
                        title="Add to debt"
                        className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-700"
                      >
                        <Plus className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                      </button>

                      {!isSettled && (
                        <button
                          onClick={() => onRecordPayment(debt, 'subtract')}
                          title="Record payment"
                          className="p-1.5 rounded-lg text-white dark:text-zinc-900 bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white transition-colors cursor-pointer shadow-2xs"
                        >
                          <CreditCard className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-700" />
                        </button>
                      )}

                      <button
                        onClick={() => onViewDetails(debt)}
                        title="View details"
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onEditDebt(debt)}
                        title="Edit record"
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onQuickSettle(debt)}
                        title={isSettled ? 'Reopen' : 'Mark as settled'}
                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteDebt(debt.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
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
