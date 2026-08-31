import React, { useState, useEffect } from 'react';
import { DebtItem } from '../types';
import { formatCurrency, getTodayString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  ArrowDownLeft,
  ArrowUpRight,
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
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-50 rounded-t-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col mx-auto max-w-[500px]"
          >
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
            </div>

            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  isOwedToMe ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {isOwedToMe ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 leading-tight">
                    {isOwedToMe ? 'Money Received' : 'Make Payment'}
                  </h2>
                  <p className="text-xs text-zinc-500 font-bold truncate max-w-[200px]">
                    {debt.contact.name}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10">
              <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Amount Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Amount to Record</span>
                    <button 
                      type="button" 
                      onClick={() => setAmount(remainingBalance.toString())}
                      className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase"
                    >
                      Pay in Full
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl border-2 border-zinc-100 p-4 flex items-center gap-4">
                    <div className="text-2xl font-black text-zinc-300">{currency === 'DZD' ? '' : currency}</div>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-3xl font-black text-zinc-900 placeholder:text-zinc-200 py-1"
                      required
                    />
                    {currency === 'DZD' && <span className="text-sm font-black text-zinc-400 uppercase">DZD</span>}
                  </div>
                </div>

                {/* Date & Method */}
                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
                  <div className="px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-zinc-400" />
                      <span className="text-sm font-bold text-zinc-700">Payment Date</span>
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold text-zinc-900"
                    />
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <div className="flex items-center gap-3 mb-1">
                      <CreditCard className="w-5 h-5 text-zinc-400" />
                      <span className="text-sm font-bold text-zinc-700">Payment Method</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.slice(0, 4).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border-2 ${
                            paymentMethod === m 
                              ? 'bg-zinc-900 border-zinc-900 text-white' 
                              : 'bg-white border-zinc-100 text-zinc-500'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                    <select
                      value={PAYMENT_METHODS.includes(paymentMethod) ? paymentMethod : 'Other'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-3 rounded-xl bg-zinc-100 border-none outline-none text-sm font-bold text-zinc-700"
                    >
                      <option value="">Other Methods...</option>
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-zinc-200 p-4">
                  <textarea
                    placeholder="Transaction ID or Note (Optional)"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-base min-h-[80px] resize-none"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 bg-white border-t border-zinc-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-500 font-bold active:scale-95 transition-transform"
              >
                Back
              </button>
              <button
                type="submit"
                form="payment-form"
                className="flex-[2] py-4 rounded-2xl bg-zinc-950 text-white font-bold shadow-lg shadow-zinc-950/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                Confirm Recording <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
