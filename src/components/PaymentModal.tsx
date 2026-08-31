import React, { useState, useEffect } from 'react';
import { DebtItem } from '../types';
import { formatCurrency, getTodayString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CreditCard, 
  Calendar, 
  ChevronRight
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtItem | null;
  currency: string;
  onAddPayment: (debtId: string, payment: {
    amount: number;
    date: string;
    note: string;
    paymentMethod: string;
  }) => void;
}

const PAYMENT_METHODS = [
  'Zelle',
  'BaridiMob',
  'CCP',
  'Cash',
  'Bank Transfer',
  'PayPal',
  'Apple Cash',
  'Other'
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  debt,
  currency,
  onAddPayment,
}) => {
  const remainingBalance = debt ? Math.max(0, debt.amount - debt.paidAmount) : 0;
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState('Zelle');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (debt) {
      const bal = Math.max(0, debt.amount - debt.paidAmount);
      setAmount(bal.toFixed(0));
      setDate(getTodayString());
      setPaymentMethod(debt.category === 'business' ? 'Bank Transfer' : 'Cash');
      setNote('');
    }
  }, [debt, isOpen]);

  const isOwedToMe = debt?.direction === 'owed_to_me';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    onAddPayment(debt.id, {
      amount: numAmount,
      date: date || getTodayString(),
      note: note.trim(),
      paymentMethod,
    });

    if (numAmount >= remainingBalance) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && debt && (
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
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-50 dark:bg-zinc-900 rounded-t-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col mx-auto max-w-[500px] border border-transparent dark:border-zinc-800"
          >
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            </div>

            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-bold text-sm tabular-nums ${
                  isOwedToMe ? 'theme-rec-badge' : 'theme-pay-badge'
                }`}>
                  {isOwedToMe ? '+' : '−'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {isOwedToMe ? 'Settle Receivable' : 'Settle Payable'}
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[200px]">
                    {debt.contact.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Amount Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Amount to Record</span>
                    <button 
                      type="button" 
                      onClick={() => setAmount(remainingBalance.toString())}
                      className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg uppercase cursor-pointer"
                    >
                      Pay in Full
                    </button>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-100 dark:border-zinc-800 p-4 flex items-center gap-4">
                    <div className="text-2xl font-black text-zinc-300 dark:text-zinc-600">{currency === 'DZD' ? '' : currency}</div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-3xl font-black text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-200 dark:placeholder:text-zinc-700 py-1"
                      required
                    />
                    {currency === 'DZD' && <span className="text-sm font-black text-zinc-400 dark:text-zinc-500 uppercase">DZD</span>}
                  </div>
                </div>

                {/* Date & Method */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Payment Date</span>
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <div className="flex items-center gap-3 mb-1">
                      <CreditCard className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Payment Method</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.slice(0, 4).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 cursor-pointer ${
                            paymentMethod === m 
                              ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900' 
                              : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-750'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <select
                      value={PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : 'Other'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-none outline-none text-sm font-bold text-zinc-700 dark:text-zinc-200"
                    >
                      <option value="">Other Methods...</option>
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                  <textarea
                    placeholder="Transaction ID or Note (Optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-base text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 min-h-[80px] resize-none"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 font-bold active:scale-95 transition-transform cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                form="payment-form"
                className="flex-[2] py-4 rounded-2xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold shadow-lg shadow-zinc-950/20 active:scale-95 transition-transform flex items-center justify-center gap-2 cursor-pointer"
              >
                Confirm Settlement <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
