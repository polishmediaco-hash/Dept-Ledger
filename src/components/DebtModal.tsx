import React, { useState, useEffect, useMemo } from 'react';
import { DebtItem, DebtType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  DollarSign, 
  Calendar, 
  Tag, 
  Info, 
  Hash, 
  Phone,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: Omit<DebtItem, 'id' | 'createdAt' | 'updatedAt' | 'payments'> & { id?: string }) => void;
  editingDebt?: DebtItem | null;
  currency: string;
  existingDebts?: DebtItem[];
}

export function DebtModal({ isOpen, onClose, onSave, editingDebt, currency, existingDebts = [] }: DebtModalProps) {
  const [type, setType] = useState<DebtType>(DebtType.OWE_ME);
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [ccpNumber, setCcpNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<'personal' | 'business'>('personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (editingDebt) {
      setType(editingDebt.direction === 'owed_to_me' ? DebtType.OWE_ME : DebtType.I_OWE);
      setContactName(editingDebt.contact.name);
      setContactInfo(editingDebt.contact.phone || '');
      setCcpNumber(editingDebt.contact.ccpNumber || '');
      setAmount(editingDebt.amount.toString());
      setDescription(editingDebt.title || '');
      setDueDate(editingDebt.dueDate || '');
      setStartDate(editingDebt.startDate);
      setCategory(editingDebt.category);
      setPriority(editingDebt.priority);
      setShowAdvanced(true);
    } else {
      setType(DebtType.OWE_ME);
      setContactName('');
      setContactInfo('');
      setCcpNumber('');
      setAmount('');
      setDescription('');
      setDueDate('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setCategory('personal');
      setPriority('medium');
      setShowAdvanced(false);
    }
  }, [editingDebt, isOpen]);

  // Derive unique contacts
  const contacts = useMemo(() => {
    const map = new Map<string, { info: string; ccp: string }>();
    existingDebts.forEach(d => {
      const lowerName = d.contact.name.toLowerCase();
      if (!map.has(lowerName)) {
        map.set(lowerName, {
          info: d.contact.phone || '',
          ccp: d.contact.ccpNumber || ''
        });
      }
    });
    return Array.from(map.entries()).map(([lowerName, data]) => ({ 
      name: existingDebts.find(d => d.contact.name.toLowerCase() === lowerName)?.contact.name || lowerName, 
      ...data 
    }));
  }, [existingDebts]);

  const filteredContacts = useMemo(() => {
    if (!contactName.trim()) return [];
    return contacts.filter(c => 
      c.name.toLowerCase().includes(contactName.toLowerCase())
    ).slice(0, 5);
  }, [contactName, contacts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !amount) return;

    onSave({
      id: editingDebt?.id,
      title: description || (category === 'personal' ? 'Personal loan' : 'Business payable'),
      direction: type === DebtType.OWE_ME ? 'owed_to_me' : 'i_owe',
      category,
      amount: parseFloat(amount),
      paidAmount: editingDebt ? editingDebt.paidAmount : 0,
      currency,
      startDate,
      dueDate,
      priority,
      contact: {
        name: contactName.trim(),
        ccpNumber: ccpNumber.trim(),
        phone: contactInfo.trim(),
      },
      notes: '',
      isArchived: false,
      ownerId: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/50 dark:bg-black/70 backdrop-blur-xs" onClick={onClose}>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border border-transparent dark:border-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-20">
            <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">{editingDebt ? 'Edit Record' : 'New Debt Entry'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Direction Selector */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setType(DebtType.OWE_ME)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  type === DebtType.OWE_ME ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Owed To Me (+)
              </button>
              <button
                type="button"
                onClick={() => setType(DebtType.I_OWE)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  type === DebtType.I_OWE ? 'bg-white dark:bg-zinc-900 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                I Owe (-)
              </button>
            </div>

            {/* Essential Field 1: Contact Name */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" />
                Contact / Person Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent transition-all outline-none text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                value={contactName}
                onChange={(e) => {
                  setContactName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              
              {showSuggestions && filteredContacts.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden">
                  {filteredContacts.map((contact, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/60 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700/60 last:border-0 transition-colors cursor-pointer"
                      onMouseDown={(e) => {
                        e.preventDefault(); 
                        setContactName(contact.name);
                        setContactInfo(contact.info);
                        setCcpNumber(contact.ccp);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{contact.name}</span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-400">{contact.info || contact.ccp || 'Saved contact'}</span>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-emerald-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Essential Field 2: Amount */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Total Amount ({currency})
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                  <span className="text-base font-extrabold text-zinc-400 dark:text-zinc-500">{currency}</span>
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="0.00"
                  className={`w-full pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-xl font-black text-zinc-900 dark:text-zinc-100 ${
                    currency.length > 3 ? 'pl-20' : 'pl-14'
                  }`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Essential Field 3: Due Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Due Date (Optional)
              </label>
              <input
                type="date"
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-xs font-bold text-zinc-800 dark:text-zinc-200"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Progressive Disclosure Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full py-2 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/70 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700 flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <span>{showAdvanced ? 'Hide Advanced Options' : 'More Options (Reason, Category, Priority, CCP)'}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-zinc-400 dark:text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />}
            </button>

            {/* Collapsible Advanced Options */}
            {showAdvanced && (
              <div className="space-y-3.5 pt-1 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in">
                {/* Short Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Reason / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dinner, Project advance, Rent"
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-xs font-bold text-zinc-900 dark:text-zinc-100"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Category & Priority */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-xs font-bold text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="personal">Personal</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-xs font-bold text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent 🚨</option>
                    </select>
                  </div>
                </div>

                {/* Phone & CCP */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone / Handle
                    </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-xs font-bold text-zinc-900 dark:text-zinc-100"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      CCP / Account #
                    </label>
                    <input
                      type="text"
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-xs font-bold text-zinc-900 dark:text-zinc-100"
                      value={ccpNumber}
                      onChange={(e) => setCcpNumber(e.target.value)}
                    />
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Record Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-xs font-bold text-zinc-900 dark:text-zinc-100"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-4 rounded-2xl text-base font-black transition-all shadow-md active:scale-95 cursor-pointer ${
                  type === DebtType.OWE_ME 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-emerald-500/20' 
                    : 'bg-rose-500 text-white hover:bg-rose-400 shadow-rose-500/20'
                }`}
              >
                {editingDebt ? 'Save Changes' : 'Record Entry'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

