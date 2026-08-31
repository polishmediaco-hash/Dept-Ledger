import React, { useState, useEffect } from 'react';
import { 
  DebtItem, 
  DebtDirection, 
  DebtCategory, 
  PriorityLevel 
} from '../types';
import { getTodayString } from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowDownLeft,
  ArrowUpRight,
  User, 
  Briefcase, 
  ChevronDown,
  ChevronUp,
  Phone, 
  Mail, 
  CreditCard,
  Calendar,
  Tag
} from 'lucide-react';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: Omit<DebtItem, 'id' | 'createdAt' | 'updatedAt' | 'payments'> & { id?: string }) => void;
  editingDebt?: DebtItem | null;
  currency: string;
}

export const DebtModal: React.FC<DebtModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingDebt,
  currency,
}) => {
  const [direction, setDirection] = useState<DebtDirection>('owed_to_me');
  const [category, setCategory] = useState<DebtCategory>('personal');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('0');
  const [startDate, setStartDate] = useState(getTodayString());
  const [dueDate, setDueDate] = useState('');
  const [hasDueDate, setHasDueDate] = useState(true);
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [priorityReason, setPriorityReason] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
    setIsSaving(false);
    if (editingDebt) {
      setDirection(editingDebt.direction);
      setCategory(editingDebt.category);
      setTitle(editingDebt.title || '');
      setAmount(editingDebt.amount.toString());
      setPaidAmount(editingDebt.paidAmount.toString());
      setStartDate(editingDebt.startDate || getTodayString());
      setDueDate(editingDebt.dueDate || '');
      setHasDueDate(!!editingDebt.dueDate);
      setPriority(editingDebt.priority || 'medium');
      setPriorityReason(editingDebt.priorityReason || '');
      setName(editingDebt.contact.name || '');
      setCompany(editingDebt.contact.company || '');
      setRelationship(editingDebt.contact.relationship || '');
      setPhone(editingDebt.contact.phone || '');
      setEmail(editingDebt.contact.email || '');
      setPaymentDetails(editingDebt.contact.paymentDetails || '');
      setNotes(editingDebt.notes || '');
      setTags(editingDebt.tags ? editingDebt.tags.join(', ') : '');
      if (editingDebt.contact.phone || editingDebt.contact.email || editingDebt.contact.paymentDetails || editingDebt.notes || editingDebt.priorityReason) {
        setShowAdvanced(true);
      }
    } else {
      setDirection('owed_to_me');
      setCategory('personal');
      setTitle('');
      setAmount('');
      setPaidAmount('0');
      setStartDate(getTodayString());
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setDueDate(d.toISOString().slice(0, 10));
      setHasDueDate(true);
      setPriority('medium');
      setPriorityReason('');
      setName('');
      setCompany('');
      setRelationship('');
      setPhone('');
      setEmail('');
      setPaymentDetails('');
      setNotes('');
      setTags('');
      setShowAdvanced(false);
    }
  }, [editingDebt, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!name.trim()) {
      setErrorMessage('Please enter a name');
      return;
    }
    
    // Support comma decimal separator for some regions
    const amountStr = amount.toString().replace(',', '.');
    const numAmount = parseFloat(amountStr);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0');
      return;
    }
    
    const paidAmountStr = paidAmount.toString().replace(',', '.');
    const numPaid = parseFloat(paidAmountStr) || 0;

    setIsSaving(true);
    try {
      await onSave({
        id: editingDebt ? editingDebt.id : undefined,
        title: title.trim() || `${direction === 'owed_to_me' ? 'Loan to' : 'Payable to'} ${name.trim()}`,
        direction,
        category,
        amount: numAmount,
        paidAmount: Math.min(numAmount, Math.max(0, numPaid)),
        currency: currency || 'DZD',
        startDate: startDate || getTodayString(),
        dueDate: hasDueDate ? (dueDate || '') : '',
        priority,
        priorityReason: priorityReason.trim(),
        contact: {
          name: name.trim(),
          company: company.trim(),
          relationship: relationship.trim(),
          phone: phone.trim(),
          email: email.trim(),
          paymentDetails: paymentDetails.trim(),
        },
        notes: notes.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      });
      onClose();
    } catch (error) {
      console.error('DebtModal: Save error:', error);
      setErrorMessage('Failed to save. Please check your connection.');
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-50 rounded-t-[32px] shadow-2xl overflow-hidden max-h-[92vh] flex flex-col mx-auto max-w-[500px]"
          >
            {/* iOS Handle */}
            <div className="w-full flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">
                  {editingDebt ? 'Edit Record' : 'New Record'}
                </h2>
                <p className="text-sm text-zinc-500 font-medium">
                  {direction === 'owed_to_me' ? 'Money owed to you' : 'Money you owe'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 active:scale-90 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-10">
              {errorMessage && (
                <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-bold text-center animate-shake">
                  {errorMessage}
                </div>
              )}
              <form id="debt-form" onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Direction Toggles */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDirection('owed_to_me')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                      direction === 'owed_to_me' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
                        : 'bg-white border-zinc-100 text-zinc-400'
                    }`}
                  >
                    <ArrowDownLeft className={`w-6 h-6 mb-1 ${direction === 'owed_to_me' ? 'text-emerald-600' : ''}`} />
                    <span className="text-xs font-bold">Owed to Me</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('i_owe')}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                      direction === 'i_owe' 
                        ? 'bg-rose-50 border-rose-500 text-rose-900' 
                        : 'bg-white border-zinc-100 text-zinc-400'
                    }`}
                  >
                    <ArrowUpRight className={`w-6 h-6 mb-1 ${direction === 'i_owe' ? 'text-rose-600' : ''}`} />
                    <span className="text-xs font-bold">I Owe Them</span>
                  </button>
                </div>

                {/* 2. Category */}
                <div className="flex p-1 bg-zinc-200/50 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCategory('personal')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      category === 'personal' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                    }`}
                  >
                    <User className="w-4 h-4" /> Personal
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('business')}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      category === 'business' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" /> Business
                  </button>
                </div>

                {/* 3. Name & Amount */}
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
                    <div className="px-4 py-3 flex items-center gap-3">
                      <User className="w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Name (e.g. David)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-base font-medium placeholder:text-zinc-400 py-1"
                        required
                      />
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <span className="text-base font-bold text-zinc-400 w-5 text-center">{currency === 'DZD' ? '' : currency}</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-2xl font-black placeholder:text-zinc-300 py-1"
                        required
                      />
                      {currency === 'DZD' && <span className="text-sm font-bold text-zinc-400 uppercase">DZD</span>}
                    </div>
                    <div className="px-4 py-3 flex items-center gap-3">
                      <Tag className="w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Purpose (e.g. Rent, Pizza)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-base font-medium placeholder:text-zinc-400 py-1"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Dates & Urgency */}
                <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-zinc-400" />
                      <span className="text-sm font-bold text-zinc-700">Debt Date</span>
                    </div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-bold text-zinc-900"
                    />
                  </div>
                  <div className="px-4 py-3 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-zinc-400" />
                        <span className="text-sm font-bold text-zinc-700">Due Date</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!hasDueDate ? (
                          <button 
                            type="button"
                            onClick={() => setHasDueDate(true)}
                            className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md uppercase"
                          >
                            Set Date
                          </button>
                        ) : (
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm font-bold text-zinc-900"
                          />
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHasDueDate(!hasDueDate)}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 transition-all ${
                        !hasDueDate 
                          ? 'bg-zinc-900 border-zinc-900 text-white' 
                          : 'bg-white border-zinc-100 text-zinc-400'
                      }`}
                    >
                      {hasDueDate ? 'Switch to No Due Date' : 'No Due Date Enabled'}
                    </button>
                  </div>
                  <div className="px-4 py-4 space-y-3">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Urgency</span>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high', 'urgent'] as PriorityLevel[]).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all border-2 ${
                            priority === p 
                              ? p === 'urgent' ? 'bg-rose-50 border-rose-500 text-rose-600' 
                                : p === 'high' ? 'bg-amber-50 border-amber-500 text-amber-600'
                                : p === 'medium' ? 'bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-zinc-100 border-zinc-400 text-zinc-600'
                              : 'bg-white border-zinc-100 text-zinc-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Advanced Toggle */}
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full py-3 flex items-center justify-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-widest"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showAdvanced ? 'Less Details' : 'More Details'}
                </button>

                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden divide-y divide-zinc-100">
                      <div className="px-4 py-3 flex items-center gap-3">
                        <Phone className="w-5 h-5 text-zinc-400" />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-base py-1"
                        />
                      </div>
                      <div className="px-4 py-3 flex items-center gap-3">
                        <Mail className="w-5 h-5 text-zinc-400" />
                        <input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-base py-1"
                        />
                      </div>
                      <div className="px-4 py-3 flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="CCP / BaridiMob / PayPal"
                          value={paymentDetails}
                          onChange={(e) => setPaymentDetails(e.target.value)}
                          className="flex-1 bg-transparent border-none outline-none text-base py-1"
                        />
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-4">
                      <textarea
                        placeholder="Additional notes..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-base min-h-[100px] resize-none"
                      />
                    </div>
                  </motion.div>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-zinc-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-500 font-bold active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="debt-form"
                disabled={isSaving}
                className="flex-[2] py-4 rounded-2xl bg-zinc-950 text-white font-bold shadow-lg shadow-zinc-950/20 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  editingDebt ? 'Update Record' : 'Create Record'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
