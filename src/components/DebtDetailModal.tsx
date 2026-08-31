import React, { useState } from 'react';
import { DebtItem, TransactionType } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDurationElapsed, 
  formatDeadlineStatus, 
} from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ConfirmModal } from './ConfirmModal';
import { 
  X, 
  User, 
  Briefcase, 
  Calendar, 
  Clock, 
  CreditCard, 
  Phone, 
  Hash, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Plus,
  MinusCircle,
  PlusCircle,
  RotateCcw
} from 'lucide-react';

interface DebtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtItem | null;
  currency: string;
  onRecordPayment: (debt: DebtItem, mode?: TransactionType) => void;
  onEditDebt: (debt: DebtItem) => void;
  onDeleteDebt: (debtId: string) => void;
  onQuickSettle: (debt: DebtItem) => void;
  onDeletePaymentRecord: (debtId: string, paymentId: string) => void;
}

export const DebtDetailModal: React.FC<DebtDetailModalProps> = ({
  isOpen,
  onClose,
  debt,
  currency,
  onRecordPayment,
  onEditDebt,
  onDeleteDebt,
  onQuickSettle,
  onDeletePaymentRecord,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isConfirmDeleteDebtOpen, setIsConfirmDeleteDebtOpen] = useState(false);
  const [pendingDeletePayment, setPendingDeletePayment] = useState<{ id: string; amount: number } | null>(null);
  const [isSettlingAction, setIsSettlingAction] = useState(false);

  if (!debt) return null;

  const balance = Math.max(0, debt.amount - debt.paidAmount);
  const isSettled = balance <= 0.001;
  const isOwedToMe = debt.direction === 'owed_to_me';
  const deadlineInfo = formatDeadlineStatus(debt.dueDate, isSettled);
  const durationText = formatDurationElapsed(debt.startDate);
  const percentPaid = Math.min(100, Math.round((debt.paidAmount / debt.amount) * 100)) || 0;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSettleClick = () => {
    setIsSettlingAction(true);
    if (!isSettled) {
      try {
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.65 }
        });
      } catch (e) {
        // ignore
      }
    }
    onQuickSettle(debt);
    setTimeout(() => setIsSettlingAction(false), 500);
  };

  return (
    <>
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
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-50 dark:bg-zinc-900 rounded-t-[32px] shadow-2xl overflow-hidden max-h-[94vh] flex flex-col mx-auto max-w-[500px] border border-transparent dark:border-zinc-800"
          >
            {/* iOS Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            </div>

            {/* Header / Banner Area */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm tabular-nums ${
                  isOwedToMe ? 'theme-rec-badge' : 'theme-pay-badge'
                }`}>
                  {isOwedToMe ? '+' : '−'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight tabular-nums">
                    {formatCurrency(balance, currency)}
                  </h2>
                  <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {isOwedToMe ? 'Owed to you' : 'You owe this'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditDebt(debt)}
                  className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Counterparty Card */}
              <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                      {debt.category === 'personal' ? <User className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{debt.contact.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium capitalize">{debt.category} Record</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                    debt.priority === 'urgent' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {debt.priority}
                  </div>
                </div>

                {/* Progress Mini */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Progress</span>
                    <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{percentPaid}% Paid</span>
                  </div>
                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isSettled ? 'bg-emerald-500' : isOwedToMe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Timing info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Aging</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{durationText}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{formatDate(debt.startDate)}</div>
                </div>
                <div className={`rounded-[24px] border p-4 space-y-1 ${
                  deadlineInfo.urgencyClass === 'bg-rose-50 text-rose-800' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/60 text-rose-900 dark:text-rose-200' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100'
                }`}>
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Deadline</span>
                  </div>
                  <div className="text-sm font-bold">{deadlineInfo.label}</div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">{debt.dueDate ? formatDate(debt.dueDate) : 'No Date'}</div>
                </div>
              </div>

              {/* Contact Actions */}
              {(debt.contact.phone || debt.contact.ccpNumber || debt.contact.paymentDetails) && (
                <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                  {debt.contact.phone && (
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{debt.contact.phone}</span>
                      </div>
                      <button onClick={() => copyText(debt.contact.phone!, 'phone')} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                        {copiedKey === 'phone' ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                  {debt.contact.ccpNumber && (
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">CCP Number</span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{debt.contact.ccpNumber}</span>
                        </div>
                      </div>
                      <button onClick={() => copyText(debt.contact.ccpNumber!, 'ccp')} className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer">
                        {copiedKey === 'ccp' ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                  {debt.contact.paymentDetails && (
                    <div className="px-5 py-4 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/40">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-emerald-500" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Payment Target</span>
                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{debt.contact.paymentDetails}</span>
                        </div>
                      </div>
                      <button onClick={() => copyText(debt.contact.paymentDetails!, 'pay')} className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 shadow-sm cursor-pointer">
                        {copiedKey === 'pay' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Payments & Adjustments History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Transaction History ({debt.payments ? debt.payments.length : 0})
                  </h4>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                    Chronological Ledger
                  </span>
                </div>

                {debt.payments && debt.payments.length > 0 ? (
                  <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                    {debt.payments.map((p) => {
                      const isAddition = p.type === 'add';
                      return (
                        <div key={p.id} className="px-4 py-3 flex items-center justify-between gap-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/50 transition-colors">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                              isAddition 
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900' 
                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                            }`}>
                              {isAddition ? '+' : '−'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${
                                  isAddition ? 'text-amber-800 dark:text-amber-300' : 'text-emerald-800 dark:text-emerald-300'
                                }`}>
                                  {isAddition 
                                    ? (isOwedToMe ? 'Lent More (+)' : 'Borrowed More (+)')
                                    : (isOwedToMe ? 'Payment Received (−)' : 'Payment Made (−)')
                                  }
                                </span>
                                <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 tabular-nums">
                                  {isAddition ? '+' : '−'}{formatCurrency(p.amount, currency)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                                <span>{formatDate(p.date)}</span>
                                {p.paymentMethod && <span>&bull; {p.paymentMethod}</span>}
                                {p.note && <span className="italic truncate max-w-[140px]">&bull; "{p.note}"</span>}
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => setPendingDeletePayment({ id: p.id, amount: p.amount })} 
                            className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-600 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer transition-all shrink-0"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-zinc-900 rounded-[24px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 p-6 text-center">
                    <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500">No transactions or payments logged yet</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1">Use the buttons above to log loan top-ups (+) or payments (−)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Floating Actions */}
            <div className="p-4 sm:p-5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2.5 shrink-0">
              <div className="flex gap-2">
                <button
                  onClick={() => onRecordPayment(debt, 'add')}
                  className="flex-1 py-3 px-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span>Add Debt</span>
                </button>
                
                {!isSettled && (
                  <button
                    onClick={() => onRecordPayment(debt, 'subtract')}
                    className="flex-1 py-3 px-3 rounded-2xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white font-bold text-xs shadow-md shadow-zinc-950/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                    <span>Record Payment</span>
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSettleClick}
                  disabled={isSettlingAction}
                  className={`flex-1 py-3 rounded-2xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSettled 
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700' 
                      : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                  }`}
                >
                  {isSettled ? (
                    <>
                      <RotateCcw className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      <span>Re-open Debt</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{isSettlingAction ? 'Settling...' : 'Settle in Full'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsConfirmDeleteDebtOpen(true)}
                  className="w-11 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 flex items-center justify-center active:scale-95 transition-all cursor-pointer border border-zinc-200/80 dark:border-zinc-700"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Confirmation Modal for Entire Debt Record */}
    <ConfirmModal
      isOpen={isConfirmDeleteDebtOpen}
      onClose={() => setIsConfirmDeleteDebtOpen(false)}
      onConfirm={() => {
        onDeleteDebt(debt.id);
        onClose();
      }}
      title="Delete Entire Debt Record?"
      description="Are you sure you want to delete this record? This action cannot be undone and will permanently remove this record along with its entire payment history."
      confirmText="Yes, Delete Record"
      cancelText="Keep Record"
      variant="danger"
      itemDetails={{
        name: debt.contact.name,
        amount: formatCurrency(debt.amount, currency),
        category: debt.category
      }}
    />

    {/* Confirmation Modal for Individual Transaction Record */}
    <ConfirmModal
      isOpen={!!pendingDeletePayment}
      onClose={() => setPendingDeletePayment(null)}
      onConfirm={() => {
        if (pendingDeletePayment) {
          onDeletePaymentRecord(debt.id, pendingDeletePayment.id);
          setPendingDeletePayment(null);
        }
      }}
      title="Delete Transaction Entry?"
      description="Are you sure you want to remove this transaction entry from the ledger? The balance will recalculate automatically."
      confirmText="Delete Entry"
      cancelText="Cancel"
      variant="danger"
      itemDetails={pendingDeletePayment ? {
        name: debt.contact.name,
        amount: formatCurrency(pendingDeletePayment.amount, currency),
      } : undefined}
    />
    </>
  );
};
