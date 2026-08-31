import React, { useState, useMemo } from 'react';
import { DebtItem, PaymentRecord } from '../types';
import { format } from 'date-fns';
import { 
  History, 
  Calendar, 
  Search,
  CreditCard,
  PlusCircle,
  MinusCircle,
  Filter
} from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

interface PaymentHistoryProps {
  debts: DebtItem[];
  currency: string;
}

interface FlattenedPayment extends PaymentRecord {
  debtTitle: string;
  contactName: string;
  direction: 'owed_to_me' | 'i_owe';
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ debts, currency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | 'subtract' | 'add'>('all');

  const allPayments = useMemo(() => {
    const flattened: FlattenedPayment[] = [];
    debts.forEach(debt => {
      (debt.payments || []).forEach(payment => {
        flattened.push({
          ...payment,
          type: payment.type || 'subtract',
          debtTitle: debt.title,
          contactName: debt.contact.name,
          direction: debt.direction
        });
      });
    });

    // Sort by date descending
    return flattened.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [debts]);

  const filteredPayments = useMemo(() => {
    return allPayments.filter(p => {
      // Type filter
      if (actionFilter !== 'all' && (p.type || 'subtract') !== actionFilter) {
        return false;
      }
      // Search filter
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.debtTitle.toLowerCase().includes(q) || 
        p.contactName.toLowerCase().includes(q) ||
        (p.note || '').toLowerCase().includes(q) ||
        (p.paymentMethod || '').toLowerCase().includes(q)
      );
    });
  }, [allPayments, searchQuery, actionFilter]);

  const addCount = useMemo(() => allPayments.filter(p => p.type === 'add').length, [allPayments]);
  const subtractCount = useMemo(() => allPayments.filter(p => (p.type || 'subtract') === 'subtract').length, [allPayments]);

  return (
    <div className="space-y-4 pb-20">
      {/* Header Info & Filters */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-4 shadow-2xs transition-colors space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 flex items-center justify-center shadow-xs">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Transaction Logs</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              {allPayments.length} total ledger records ({addCount} additions, {subtractCount} payments)
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          <input 
            type="text"
            placeholder="Search transactions, notes, people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex gap-1.5 pt-0.5">
          <button
            onClick={() => setActionFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              actionFilter === 'all'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            All ({allPayments.length})
          </button>
          <button
            onClick={() => setActionFilter('subtract')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              actionFilter === 'subtract'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <MinusCircle className="w-3.5 h-3.5" />
            Payments ({subtractCount})
          </button>
          <button
            onClick={() => setActionFilter('add')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              actionFilter === 'add'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Additions ({addCount})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {filteredPayments.length === 0 ? (
          <div className="py-12 text-center space-y-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-dashed rounded-2xl">
            <div className="h-12 w-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-300 dark:text-zinc-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-semibold text-xs">No transactions found</p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const isAddition = payment.type === 'add';
            const isOwedToMe = payment.direction === 'owed_to_me';

            let actionLabel = '';
            if (isAddition) {
              actionLabel = isOwedToMe ? 'Lent More (+)' : 'Borrowed More (+)';
            } else {
              actionLabel = isOwedToMe ? 'Payment Received (−)' : 'Payment Made (−)';
            }

            return (
              <div 
                key={payment.id} 
                className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-3.5 shadow-2xs relative overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border font-black text-xs tabular-nums ${
                      isAddition
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                        : isOwedToMe 
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' 
                        : 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                    }`}>
                      {isAddition ? '+' : '−'}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none truncate">
                          {payment.contactName}
                        </h3>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isAddition 
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' 
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {actionLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[170px]">
                        {payment.debtTitle}
                      </p>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(payment.date), 'MMM d, yyyy')}
                        </span>
                        {payment.paymentMethod && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                            <CreditCard className="w-3 h-3" />
                            {payment.paymentMethod}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`text-xs font-black tabular-nums ${
                      isAddition
                        ? 'text-amber-600 dark:text-amber-400'
                        : isOwedToMe
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {isAddition ? '+' : '−'}{formatCurrency(payment.amount, currency)}
                    </div>
                    {payment.note && (
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mt-0.5 max-w-[140px] truncate">
                        "{payment.note}"
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Visual Accent stripe */}
                <div className={`absolute top-0 right-0 w-1 h-full ${
                  isAddition 
                    ? 'bg-amber-500' 
                    : isOwedToMe 
                    ? 'bg-emerald-500' 
                    : 'bg-rose-500'
                }`} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

