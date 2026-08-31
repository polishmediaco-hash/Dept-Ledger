import React, { useState } from 'react';
import { DebtItem, DebtDirection, DebtCategory, PriorityLevel } from '../types';
import { getTodayString } from '../utils/dateUtils';
import { 
  Plus, 
  User, 
  Briefcase, 
  SlidersHorizontal,
} from 'lucide-react';

interface QuickAddBarProps {
  currency: string;
  onQuickAdd: (debt: Omit<DebtItem, 'id' | 'createdAt' | 'updatedAt' | 'payments'>) => void;
  onOpenFullModal: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  currency,
  onQuickAdd,
  onOpenFullModal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState<DebtDirection>('owed_to_me');
  const [category, setCategory] = useState<DebtCategory>('personal');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter who owes or is owed.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    onQuickAdd({
      title: title.trim() || `${direction === 'owed_to_me' ? 'Loan to' : 'Payable to'} ${name.trim()}`,
      direction,
      category,
      amount: parsedAmount,
      paidAmount: 0,
      currency,
      startDate: getTodayString(),
      dueDate: dueDate || '',
      priority,
      priorityReason: '',
      contact: {
        name: name.trim(),
        company: '',
        relationship: category === 'personal' ? 'Friend / Family' : 'Business',
        phone: '',
        paymentDetails: '',
      },
      notes: '',
      tags: [category],
    });

    // Reset inputs
    setName('');
    setAmount('');
    setTitle('');
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().slice(0, 10));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xs mb-6 transition-all">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
            <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight">Quick Add</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Record a debt or loan in seconds</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenFullModal}
          className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 border border-zinc-200 dark:border-zinc-700 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Full Form</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Row 1: Direction & Category selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Direction toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setDirection('owed_to_me')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                direction === 'owed_to_me'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="tabular-nums font-bold">+</span>
              <span>They Owe Me</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection('i_owe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                direction === 'i_owe'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="tabular-nums font-bold">−</span>
              <span>I Owe Them</span>
            </button>
          </div>

          {/* Category toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setCategory('personal')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                category === 'personal'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Personal</span>
            </button>
            <button
              type="button"
              onClick={() => setCategory('business')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                category === 'business'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>Business</span>
            </button>
          </div>

          {/* Priority Pill Select */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium hidden sm:inline">Priority:</span>
            {(['urgent', 'high', 'medium', 'low'] as PriorityLevel[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors cursor-pointer ${
                  priority === p
                    ? p === 'urgent'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      : p === 'high'
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : p === 'medium'
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                      : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-600'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Inputs & Submit */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Person / Company Name */}
          <div className="sm:col-span-4">
            <input
              type="text"
              placeholder={category === 'personal' ? "Person's name (e.g. Sarah, David)" : "Client / Company (e.g. Acme Corp)"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
              required
            />
          </div>

          {/* Amount */}
          <div className="sm:col-span-3 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 font-bold text-xs">
              {currency}
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Amount (e.g. 150)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 outline-none transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-semibold"
              required
            />
          </div>

          {/* Due Date */}
          <div className="sm:col-span-3 relative">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 outline-none transition-all cursor-pointer font-medium"
              title="Due date (deadline)"
            />
          </div>

          {/* Submit Button */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full min-h-[36px] bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
