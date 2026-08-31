import React, { useState } from 'react';
import { DebtItem } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDurationElapsed, 
  formatDeadlineStatus,
  getDaysElapsed,
} from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  User, 
  Briefcase, 
  Calendar, 
  Clock, 
  CreditCard, 
  Phone, 
  Mail, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  MessageSquare,
  ChevronRight,
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
  const daysElapsed = getDaysElapsed(debt.startDate);
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
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-50 rounded-t-[32px] shadow-2xl overflow-hidden max-h-[94vh] flex flex-col mx-auto max-w-[500px]"
          >
            {/* iOS Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
            </div>

            {/* Header / Banner Area */}
            <div className={`px-6 py-4 flex items-center justify-between border-b ${
              isOwedToMe ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isOwedToMe ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {isOwedToMe ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900 leading-tight">
                    {formatCurrency(balance, currency)}
                  </h2>
                  <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    {isOwedToMe ? 'Owed to you' : 'You owe this'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditDebt(debt)}
                  className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Counterparty Card */}
              <div className="bg-white rounded-[24px] border border-zinc-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                      {debt.category === 'personal' ? <User className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-900">{debt.contact.name}</h3>
                      <p className="text-xs text-zinc-500 font-medium capitalize">{debt.category} Record</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                    debt.priority === 'urgent' ? 'bg-rose-100 text-rose-600' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {debt.priority}
                  </div>
                </div>

                {/* Progress Mini */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Progress</span>
                    <span className="text-xs font-black text-zinc-900">{percentPaid}% Paid</span>
                  </div>
                  <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isSettled ? 'bg-emerald-500' : isOwedToMe ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Timing info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-[24px] border border-zinc-200 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Aging</span>
                  </div>
                  <div className="text-sm font-bold text-zinc-900">{durationText}</div>
                  <div className="text-[10px] text-zinc-500 font-medium">{formatDate(debt.startDate)}</div>
                </div>
                <div className={`rounded-[24px] border p-4 space-y-1 ${
                  deadlineInfo.urgencyClass === 'bg-rose-50 text-rose-800' ? 'bg-rose-50 border-rose-100 text-rose-900' : 'bg-white border-zinc-200'
                }`}>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Deadline</span>
                  </div>
                  <div className="text-sm font-bold">{deadlineInfo.label}</div>
                  <div className="text-[10px] text-zinc-500 font-medium">{debt.dueDate ? formatDate(debt.dueDate) : 'No Date'}</div>
                </div>
              </div>

              {/* Contact Actions */}
              {(debt.contact.phone || debt.contact.email || debt.contact.paymentDetails) && (
                <div className="bg-white rounded-[24px] border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                  {debt.contact.phone && (
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-zinc-400" />
                        <span className="text-sm font-bold text-zinc-900">{debt.contact.phone}</span>
                      </div>
                      <button onClick={() => copyText(debt.contact.phone!, 'phone')} className="text-zinc-400 active:text-zinc-900">
                        {copiedKey === 'phone' ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                    </div>
                  )}
                  {debt.contact.paymentDetails && (
                    <div className="px-5 py-4 flex items-center justify-between bg-zinc-50/50">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-emerald-500" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Payment Target</span>
                          <span className="text-sm font-bold text-zinc-900">{debt.contact.paymentDetails}</span>
                        </div>
                      </div>
                      <button onClick={() => copyText(debt.contact.paymentDetails!, 'pay')} className="bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm">
                        {copiedKey === 'pay' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Payments History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Transaction History</h4>
                  {!isSettled && (
                    <button onClick={() => onRecordPayment(debt)} className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
                {debt.payments && debt.payments.length > 0 ? (
                  <div className="bg-white rounded-[24px] border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                    {debt.payments.map((p) => (
                      <div key={p.id} className="px-5 py-4 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-zinc-900">+{formatCurrency(p.amount, currency)}</span>
                          <span className="text-[10px] font-bold text-zinc-400">{formatDate(p.date)} &bull; {p.paymentMethod}</span>
                        </div>
                        <button onClick={() => onDeletePaymentRecord(debt.id, p.id)} className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-300 hover:text-rose-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[24px] border-2 border-dashed border-zinc-100 p-8 text-center">
                    <p className="text-xs font-bold text-zinc-300">No payments recorded yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Floating Actions */}
            <div className="p-6 bg-white border-t border-zinc-100 flex flex-col gap-3 shrink-0">
              {!isSettled && (
                <button
                  onClick={() => onRecordPayment(debt)}
                  className="w-full py-4 rounded-2xl bg-zinc-950 text-white font-bold shadow-lg shadow-zinc-950/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5 text-emerald-400" />
                  Record a New Payment
                </button>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => onQuickSettle(debt)}
                  className={`flex-1 py-4 rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 ${
                    isSettled ? 'bg-zinc-100 text-zinc-500' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  {isSettled ? 'Re-open' : 'Full Settle'}
                </button>
                {isOwedToMe && !isSettled && (
                  <button
                    onClick={() => onOpenReminder(debt)}
                    className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-700 font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
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
                  className="w-14 py-4 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center active:scale-95 transition-transform"
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
