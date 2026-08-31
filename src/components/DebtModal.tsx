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
  AtSign, 
  Phone,
  Plus,
  AlertCircle
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
  const [contactEmail, setContactEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [category, setCategory] = useState<'personal' | 'business'>('personal');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (editingDebt) {
      setType(editingDebt.direction === 'owed_to_me' ? DebtType.OWE_ME : DebtType.I_OWE);
      setContactName(editingDebt.contact.name);
      setContactInfo(editingDebt.contact.phone || '');
      setContactEmail(editingDebt.contact.email || '');
      setAmount(editingDebt.amount.toString());
      setDescription(editingDebt.title || '');
      setDueDate(editingDebt.dueDate || '');
      setStartDate(editingDebt.startDate);
      setCategory(editingDebt.category);
      setPriority(editingDebt.priority);
    } else {
      setType(DebtType.OWE_ME);
      setContactName('');
      setContactInfo('');
      setContactEmail('');
      setAmount('');
      setDescription('');
      setDueDate('');
      setStartDate(new Date().toISOString().slice(0, 10));
      setCategory('personal');
      setPriority('medium');
    }
  }, [editingDebt, isOpen]);

  // Derive unique contacts
  const contacts = useMemo(() => {
    const map = new Map<string, { info: string; email: string }>();
    existingDebts.forEach(d => {
      const lowerName = d.contact.name.toLowerCase();
      if (!map.has(lowerName)) {
        map.set(lowerName, {
          info: d.contact.phone || '',
          email: d.contact.email || ''
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
    onSave({
      id: editingDebt?.id,
      title: description,
      direction: type === DebtType.OWE_ME ? 'owed_to_me' : 'i_owe',
      category,
      amount: parseFloat(amount),
      paidAmount: editingDebt ? editingDebt.paidAmount : 0,
      currency,
      startDate,
      dueDate,
      priority,
      contact: {
        name: contactName,
        email: contactEmail,
        phone: contactInfo,
      },
      notes: '',
      isArchived: false,
      ownerId: '', // Set in App.tsx
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-20">
            <h2 className="text-xl font-black text-zinc-900">{editingDebt ? 'Edit Record' : 'New Entry'}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100 text-zinc-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Type Selector */}
            <div className="flex p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setType(DebtType.OWE_ME)}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                  type === DebtType.OWE_ME ? 'bg-white text-emerald-600 shadow-sm' : 'text-zinc-500'
                }`}
              >
                Owed To Me
              </button>
              <button
                type="button"
                onClick={() => setType(DebtType.I_OWE)}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                  type === DebtType.I_OWE ? 'bg-white text-rose-600 shadow-sm' : 'text-zinc-500'
                }`}
              >
                I Owe
              </button>
            </div>

            <div className="space-y-4">
              {/* Contact Name Autocomplete */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Contact Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Who is this for?"
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[20px] focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none text-sm font-bold"
                  value={contactName}
                  onChange={(e) => {
                    setContactName(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                
                {showSuggestions && filteredContacts.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {filteredContacts.map((contact, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full px-5 py-4 text-left hover:bg-zinc-50 flex items-center justify-between border-b border-zinc-100 last:border-0 transition-colors"
                        onClick={() => {
                          setContactName(contact.name);
                          setContactInfo(contact.info);
                          setContactEmail(contact.email);
                          setShowSuggestions(false);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900">{contact.name}</span>
                          <span className="text-[10px] text-zinc-500 font-medium uppercase">{contact.info || contact.email || 'Saved contact'}</span>
                        </div>
                        <Plus className="w-4 h-4 text-emerald-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    Phone / Info
                  </label>
                  <input
                    type="text"
                    placeholder="Optional info"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[20px] focus:ring-2 focus:ring-zinc-900 outline-none text-sm font-bold"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <AtSign className="w-3.5 h-3.5" />
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[20px] focus:ring-2 focus:ring-zinc-900 outline-none text-sm font-bold"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Amount ({currency})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    className="w-full pl-12 pr-5 py-5 bg-zinc-50 border border-zinc-200 rounded-[24px] focus:ring-2 focus:ring-zinc-900 outline-none text-2xl font-black"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-zinc-300">{currency}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Category & Priority
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[20px] focus:ring-2 focus:ring-zinc-900 outline-none text-sm font-bold appearance-none"
                  >
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                  </select>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[20px] focus:ring-2 focus:ring-zinc-900 outline-none text-sm font-bold appearance-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent 🚨</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[20px] focus:ring-2 focus:ring-zinc-900 outline-none text-sm font-bold"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[20px] focus:ring-2 focus:ring-zinc-900 outline-none text-sm font-bold"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Short Title / Reason
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch, Groceries, Loan"
                className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-[20px] focus:ring-2 focus:ring-zinc-900 outline-none text-sm font-bold"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className={`w-full py-5 rounded-[24px] text-lg font-black transition-all shadow-xl active:scale-95 ${
                  type === DebtType.OWE_ME 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400' 
                    : 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-400'
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
