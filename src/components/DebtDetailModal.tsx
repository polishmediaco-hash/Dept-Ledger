import React, { useState } from 'react';
import { DebtItem } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDurationElapsed, 
  formatDeadlineStatus,
} from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
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
  MessageSquare, 
  Plus
} from 'lucide-react';

interface DebtDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtItem | null;
  currency: string;
  onRecordPayment: (debt: DebtItem) => void;
  onEditDebt: (debt: DebtItem) => void;
  onDeleteDebt: (debtId: string) => void;
  onQuickSettle: (debt: DebtItem) => void;
  onOpenReminder: (debt: DebtItem) => void;
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
  onOpenReminder,
  onDeletePaymentRecord,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  return (
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

              {/* Payments History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Transaction History</h4>
                  {!isSettled && (
                    <button onClick={() => onRecordPayment(debt)} className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg uppercase tracking-widest cursor-pointer">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
                {debt.payments && debt.payments.length > 0 ? (
                  <div className="bg-white dark:bg-zinc-900 rounded-[24px] border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                    {debt.payments.map((p) => (
                      <div key={p.id} className="px-5 py-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">+{formatCurrency(p.amount, currency)}</span>
                          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500">{formatDate(p.date)} &bull; {p.paymentMethod}</span>
                        </div>
                        <button onClick={() => onDeletePaymentRecord(debt.id, p.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 dark:text-zinc-600 hover:text-rose-500 cursor-pointer transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-zinc-900 rounded-[24px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 p-8 text-center">
                    <p className="text-xs font-bold text-zinc-300 dark:text-zinc-600">No payments recorded yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Floating Actions */}
            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-3 shrink-0">
              {!isSettled && (
                <button
                  onClick={() => onRecordPayment(debt)}
                  className="w-full py-4 rounded-2xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-lg shadow-zinc-950/20 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-5 h-5 text-emerald-400 dark:text-emerald-600" />
                  Record Settlement
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => onQuickSettle(debt)}
                  className={`flex-1 py-4 rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer ${
                    isSettled 
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400' 
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {isSettled ? 'Re-open' : 'Full Settle'}
                </button>
                {isOwedToMe && !isSettled && (
                  <button
                    onClick={() => onOpenReminder(debt)}
                    className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Remind
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Delete this entire record?')) {
                      onDeleteDebt(debt.id);
                      onClose();
                    }
                  }}
                  className="w-14 py-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
