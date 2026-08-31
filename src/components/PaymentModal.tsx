import React, { useState, useEffect } from 'react';
import { DebtItem, TransactionType } from '../types';
import { formatCurrency, getTodayString } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CreditCard, 
  Calendar, 
  MinusCircle,
  PlusCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtItem | null;
  currency: string;
  initialMode?: TransactionType;
  onAddPayment: (debtId: string, payment: {
    amount: number;
    type?: TransactionType;
    date: string;
    note: string;
    paymentMethod: string;
  }) => void;
}

const PAYMENT_METHODS = [
  'Cash',
  'BaridiMob',
  'CCP',
  'Bank Transfer',
  'Zelle',
  'PayPal',
  'Apple Cash',
  'Other'
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  debt,
  currency,
  initialMode = 'subtract',
  onAddPayment,
}) => {
  const currentBalance = debt ? Math.max(0, debt.amount - debt.paidAmount) : 0;
  
  const [transactionType, setTransactionType] = useState<TransactionType>('subtract');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (debt && isOpen) {
      const bal = Math.max(0, debt.amount - debt.paidAmount);
      setTransactionType(initialMode || 'subtract');
      setAmount(initialMode === 'subtract' && bal > 0 ? bal.toFixed(0) : '');
      setDate(getTodayString());
      setPaymentMethod(debt.category === 'business' ? 'Bank Transfer' : 'Cash');
      setNote('');
    }
  }, [debt, isOpen, initialMode]);

  if (!debt) return null;

  const isOwedToMe = debt.direction === 'owed_to_me';
  const numericAmount = parseFloat(amount) || 0;

  // Calculate projected new balance
  let projectedBalance = currentBalance;
  if (transactionType === 'add') {
    projectedBalance = currentBalance + numericAmount;
  } else {
    projectedBalance = Math.max(0, currentBalance - numericAmount);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt) return;
    if (numericAmount <= 0) return;

    onAddPayment(debt.id, {
      amount: numericAmount,
      type: transactionType,
      date: date || getTodayString(),
      note: note.trim(),
      paymentMethod,
    });

    if (transactionType === 'subtract' && numericAmount >= currentBalance) {
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

  const handleQuickAddValue = (val: number) => {
    setAmount((prev) => {
      const cur = parseFloat(prev) || 0;
      return (cur + val).toString();
    });
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[151] bg-zinc-50 dark:bg-zinc-900 rounded-t-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col mx-auto max-w-[500px] border border-transparent dark:border-zinc-800"
          >
            {/* iOS Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                    {debt.contact.name}
                  </h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    isOwedToMe 
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  }`}>
                    {isOwedToMe ? 'Owed to you' : 'You owe'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                  Current Balance: <span className="font-bold text-zinc-700 dark:text-zinc-300">{formatCurrency(currentBalance, currency)}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <form id="transaction-form" onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Transaction Type Toggle (Subtract vs. Add) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                    Select Transaction Action
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
                    {/* Subtract / Repayment */}
                    <button
                      type="button"
                      onClick={() => {
                        setTransactionType('subtract');
                        if (currentBalance > 0 && !amount) {
                          setAmount(currentBalance.toString());
                        }
                      }}
                      className={`p-3 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer text-left ${
                        transactionType === 'subtract'
                          ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xs'
                          : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Deduct / Payment
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                        {isOwedToMe ? 'Contact paid you back' : 'You paid them back'}
                      </p>
                    </button>

                    {/* Add / Increase Debt */}
                    <button
                      type="button"
                      onClick={() => setTransactionType('add')}
                      className={`p-3 rounded-xl flex flex-col items-start gap-1 transition-all cursor-pointer text-left ${
                        transactionType === 'add'
                          ? 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xs'
                          : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          Add to Debt
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">
                        {isOwedToMe ? 'You lent them more money' : 'You borrowed more money'}
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Amount Input & Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      {transactionType === 'add' ? 'Amount to Add to Debt' : 'Amount to Deduct / Pay'}
                    </span>
                    {transactionType === 'subtract' && currentBalance > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setAmount(currentBalance.toString())}
                        className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg uppercase cursor-pointer hover:bg-emerald-100 transition-colors"
                      >
                        Full Balance
                      </button>
                    )}
                  </div>
                  
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-zinc-200/90 dark:border-zinc-800 p-3.5 flex items-center gap-3">
                    <span className="text-xl font-bold text-zinc-400 dark:text-zinc-500">
                      {transactionType === 'add' ? '+' : '−'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 py-0.5 tabular-nums"
                      required
                      autoFocus
                    />
                    <span className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                      {currency}
                    </span>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {transactionType === 'add' ? (
                      [500, 1000, 2000, 5000, 10000, 20000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleQuickAddValue(val)}
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 whitespace-nowrap cursor-pointer transition-colors"
                        >
                          +{val.toLocaleString()}
                        </button>
                      ))
                    ) : (
                      <>
                        {currentBalance > 0 && (
                          <button
                            type="button"
                            onClick={() => setAmount((currentBalance * 0.5).toFixed(0))}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 whitespace-nowrap cursor-pointer"
                          >
                            50% ({formatCurrency(currentBalance * 0.5, currency)})
                          </button>
                        )}
                        {[1000, 5000, 10000].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val.toString())}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 whitespace-nowrap cursor-pointer"
                          >
                            {val.toLocaleString()}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Live Mathematical Calculation Preview */}
                <div className="p-3.5 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/60 transition-colors">
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center justify-between">
                    <span>Balance Calculation</span>
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">
                      {transactionType === 'add' ? '+ Increases Debt' : '− Lowers Debt'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-bold tabular-nums">
                    <div className="text-zinc-600 dark:text-zinc-400">
                      <span className="text-[10px] block font-normal text-zinc-400">Current</span>
                      {formatCurrency(currentBalance, currency)}
                    </div>
                    <div className="text-zinc-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="text-zinc-900 dark:text-zinc-100 font-bold">
                      <span className="text-[10px] block font-normal text-zinc-400">Action</span>
                      {transactionType === 'add' ? '+' : '−'}{formatCurrency(numericAmount, currency)}
                    </div>
                    <div className="text-zinc-400">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                    <div className="text-zinc-950 dark:text-zinc-50 font-black">
                      <span className="text-[10px] block font-normal text-zinc-400">New Balance</span>
                      {formatCurrency(projectedBalance, currency)}
                    </div>
                  </div>
                </div>

                {/* 4. Date & Method */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Transaction Date</span>
                    </div>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-bold text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                  
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Payment Channel / Method</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PAYMENT_METHODS.slice(0, 4).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border cursor-pointer truncate ${
                            paymentMethod === m 
                              ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100 text-white dark:text-zinc-900' 
                              : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Note / Transaction Description */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Transaction Note (Optional)
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder={
                      transactionType === 'add'
                        ? 'e.g. Lent additional cash for car repair...'
                        : 'e.g. Partial cash repayment, BaridiMob receipt...'
                    }
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 py-1"
                  />
                </div>

              </form>
            </div>

            {/* Footer Floating Confirmation Action */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs active:scale-95 transition-transform cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="transaction-form"
                disabled={numericAmount <= 0}
                className={`flex-1 py-3.5 px-4 rounded-2xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  numericAmount <= 0
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed border border-zinc-200 dark:border-zinc-700'
                    : 'bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 shadow-md shadow-zinc-950/10'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {transactionType === 'add' 
                    ? `Add ${formatCurrency(numericAmount, currency)} to Debt`
                    : `Record ${formatCurrency(numericAmount, currency)} Payment`
                  }
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

