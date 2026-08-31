import React, { useState, useEffect, useMemo } from 'react';
import { DebtItem, DebtType, TransactionType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  DollarSign, 
  Calendar, 
  Info, 
  Hash, 
  Phone,
  Plus,
  ChevronRight,
  ChevronLeft,
  Check,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  MinusCircle,
  CreditCard,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import { formatCurrency } from '../utils/dateUtils';

interface DebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: Omit<DebtItem, 'id' | 'createdAt' | 'updatedAt' | 'payments'> & { id?: string }) => void;
  editingDebt?: DebtItem | null;
  currency: string;
  existingDebts?: DebtItem[];
  onRecordPayment?: (debt: DebtItem, mode: TransactionType) => void;
}

export function DebtModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingDebt, 
  currency, 
  existingDebts = [],
  onRecordPayment 
}: DebtModalProps) {
  // Step state: 1 = Contact, 2 = Amount & Direction, 3 = Schedule & Details, 4 = Review & Confirm
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [directionSlide, setDirectionSlide] = useState<'forward' | 'backward'>('forward');

  // Form states
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

  // When modal opens or editingDebt changes
  useEffect(() => {
    if (editingDebt) {
      setCurrentStep(1);
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
    } else {
      setCurrentStep(1);
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
    }
  }, [editingDebt, isOpen]);

  // Derive unique contacts with active debt summaries
  const contactSummaries = useMemo(() => {
    const map = new Map<string, { 
      name: string; 
      info: string; 
      ccp: string; 
      debts: DebtItem[];
      activeDebts: DebtItem[];
      totalReceivable: number;
      totalPayable: number;
      netBalance: number;
    }>();

    existingDebts.forEach(d => {
      const lower = d.contact.name.toLowerCase().trim();
      if (!map.has(lower)) {
        map.set(lower, {
          name: d.contact.name,
          info: d.contact.phone || '',
          ccp: d.contact.ccpNumber || '',
          debts: [],
          activeDebts: [],
          totalReceivable: 0,
          totalPayable: 0,
          netBalance: 0,
        });
      }
      const item = map.get(lower)!;
      item.debts.push(d);
      const remaining = Math.max(0, d.amount - d.paidAmount);
      if (remaining > 0.001) {
        item.activeDebts.push(d);
        if (d.direction === 'owed_to_me') {
          item.totalReceivable += remaining;
        } else {
          item.totalPayable += remaining;
        }
      }
      item.netBalance = item.totalReceivable - item.totalPayable;
    });

    return Array.from(map.values());
  }, [existingDebts]);

  // Matched existing contact summary
  const matchedContactData = useMemo(() => {
    if (!contactName.trim()) return null;
    const lower = contactName.toLowerCase().trim();
    return contactSummaries.find(c => c.name.toLowerCase().trim() === lower) || null;
  }, [contactName, contactSummaries]);

  const filteredSuggestions = useMemo(() => {
    if (!contactName.trim()) return [];
    return contactSummaries.filter(c => 
      c.name.toLowerCase().includes(contactName.toLowerCase())
    ).slice(0, 5);
  }, [contactName, contactSummaries]);

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1) {
      if (!contactName.trim()) return;
      setDirectionSlide('forward');
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!amount || parseFloat(amount) <= 0) return;
      setDirectionSlide('forward');
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setDirectionSlide('forward');
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    setDirectionSlide('backward');
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSelectExistingContact = (contact: typeof contactSummaries[0]) => {
    setContactName(contact.name);
    setContactInfo(contact.info);
    setCcpNumber(contact.ccp);
    setShowSuggestions(false);
  };

  const handleQuickAddOrPay = (debt: DebtItem, mode: TransactionType) => {
    if (onRecordPayment) {
      onClose();
      onRecordPayment(debt, mode);
    }
  };

  const handleQuickDueDatePreset = (days: number | 'endOfMonth') => {
    const target = new Date();
    if (days === 'endOfMonth') {
      const nextMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0);
      setDueDate(nextMonth.toISOString().slice(0, 10));
    } else {
      target.setDate(target.getDate() + days);
      setDueDate(target.toISOString().slice(0, 10));
    }
  };

  const handleQuickAmountAdd = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleFinalSubmit = () => {
    if (!contactName.trim() || !amount || parseFloat(amount) <= 0) return;

    onSave({
      id: editingDebt?.id,
      title: description.trim() || (category === 'personal' ? 'Personal loan' : 'Business transaction'),
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

  const stepsList = [
    { num: 1, label: 'Contact' },
    { num: 2, label: 'Amount' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Confirm' },
  ];

  const numericAmount = parseFloat(amount) || 0;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/50 dark:bg-black/70 backdrop-blur-xs" 
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] sm:rounded-[32px] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl border border-transparent dark:border-zinc-800 z-[151]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header & Step Indicator */}
          <div className="px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md sticky top-0 z-20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-black flex items-center justify-center">
                  {currentStep}
                </span>
                <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  {editingDebt ? 'Edit Debt Record' : 'Record Transaction'}
                </h2>
              </div>
              
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Bar */}
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {stepsList.map((s) => {
                const isActive = s.num === currentStep;
                const isPassed = s.num < currentStep;

                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => {
                      if (s.num < currentStep) {
                        setDirectionSlide('backward');
                        setCurrentStep(s.num);
                      } else if (s.num === 2 && contactName.trim()) {
                        setDirectionSlide('forward');
                        setCurrentStep(2);
                      } else if (s.num === 3 && contactName.trim() && numericAmount > 0) {
                        setDirectionSlide('forward');
                        setCurrentStep(3);
                      }
                    }}
                    className={`flex flex-col items-center py-1 rounded-lg transition-all text-left ${
                      isActive ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                    }`}
                  >
                    <div className={`h-1.5 w-full rounded-full transition-all ${
                      isPassed 
                        ? 'bg-emerald-500' 
                        : isActive 
                        ? 'bg-zinc-900 dark:bg-zinc-100' 
                        : 'bg-zinc-200 dark:bg-zinc-800'
                    }`} />
                    <span className={`text-[10px] mt-1 font-bold ${
                      isActive 
                        ? 'text-zinc-900 dark:text-zinc-100 font-extrabold' 
                        : isPassed 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-zinc-400 dark:text-zinc-600'
                    }`}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Step Content with Animations */}
          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {/* STEP 1: CONTACT SELECTION & LOGIC TREE */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: directionSlide === 'forward' ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: directionSlide === 'forward' ? -16 : 16 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-zinc-500" />
                      Step 1: Who is this transaction with?
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Type a new person's name or choose from your existing contacts.
                    </p>
                  </div>

                  {/* Contact Name Input */}
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      required
                      placeholder="e.g. Sarah Connor, Alex, Karim"
                      value={contactName}
                      onChange={(e) => {
                        setContactName(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
                    />

                    {/* Auto-suggestions Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl overflow-hidden">
                        {filteredSuggestions.map((c, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700/60 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-700/60 last:border-0 transition-colors cursor-pointer"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectExistingContact(c);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{c.name}</span>
                              <span className="text-[10px] text-zinc-400">{c.info || c.ccp || 'Saved contact'}</span>
                            </div>
                            {c.activeDebts.length > 0 && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                c.totalReceivable > 0 
                                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              }`}>
                                {c.totalReceivable > 0 
                                  ? `Owes ${formatCurrency(c.totalReceivable, currency)}` 
                                  : `Owe ${formatCurrency(c.totalPayable, currency)}`}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* If selected contact already has an active balance, show smart branching choices */}
                  {matchedContactData && matchedContactData.activeDebts.length > 0 ? (
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/90 dark:border-zinc-700/80 rounded-2xl space-y-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3 h-3 text-zinc-700 dark:text-zinc-300" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                            Active Balance: {matchedContactData.name}
                          </h4>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium mt-0.5">
                            {matchedContactData.totalReceivable > 0 
                              ? `Currently owes you ${formatCurrency(matchedContactData.totalReceivable, currency)}` 
                              : `You currently owe ${formatCurrency(matchedContactData.totalPayable, currency)}`}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-750">
                        <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Select action for this contact:
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuickAddOrPay(matchedContactData.activeDebts[0], 'add')}
                            className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-left hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-bold text-xs">
                              <Plus className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                              <span>Add to Debt</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
                              Increase amount owed
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickAddOrPay(matchedContactData.activeDebts[0], 'subtract')}
                            className="p-3 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-left hover:bg-zinc-800 dark:hover:bg-white/90 transition-all cursor-pointer shadow-xs"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              <CreditCard className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />
                              <span>Record Payment</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-0.5 leading-tight">
                              Deduct / settle balance
                            </p>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleNext}
                          className="w-full py-1.5 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer transition-colors"
                        >
                          Or create a separate new loan entry →
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* If no active balance or typing a new contact, show quick contact list for fast tap */
                    contactSummaries.length > 0 && !contactName.trim() && (
                      <div className="space-y-2 pt-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                          Recent Contacts
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {contactSummaries.slice(0, 6).map((c, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectExistingContact(c)}
                              className="p-2.5 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/70 dark:border-zinc-700/60 rounded-xl text-left transition-all cursor-pointer"
                            >
                              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{c.name}</p>
                              <p className="text-[10px] text-zinc-400 truncate">{c.info || `${c.debts.length} records`}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </motion.div>
              )}

              {/* STEP 2: AMOUNT & DIRECTION */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: directionSlide === 'forward' ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: directionSlide === 'forward' ? -16 : 16 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-zinc-500" />
                      Step 2: Direction & Amount with {contactName}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Who is giving money to whom?
                    </p>
                  </div>

                  {/* Direction Selection Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setType(DebtType.OWE_ME)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        type === DebtType.OWE_ME 
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20' 
                          : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                          Owed to Me
                        </span>
                        {type === DebtType.OWE_ME && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-tight font-medium">
                        I lent / gave money. {contactName || 'They'} will pay me back.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setType(DebtType.I_OWE)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                        type === DebtType.I_OWE 
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20' 
                          : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-800 dark:text-rose-300">
                          I Owe
                        </span>
                        {type === DebtType.I_OWE && <Check className="w-4 h-4 text-rose-600" />}
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-tight font-medium">
                        I borrowed money. I will pay {contactName || 'them'} back.
                      </p>
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Principal Amount ({currency})
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        <span className="text-lg font-black text-zinc-400">{currency}</span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        autoFocus
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-16 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-2xl font-black text-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    {/* Quick increment pills */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                      <span className="text-[10px] text-zinc-400 font-bold mr-1">Quick add:</span>
                      {[10, 50, 100, 500, 1000].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleQuickAmountAdd(val)}
                          className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[11px] font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                        >
                          +{val}
                        </button>
                      ))}
                      {numericAmount > 0 && (
                        <button
                          type="button"
                          onClick={() => setAmount('')}
                          className="px-2 py-1 text-[10px] text-zinc-400 hover:text-rose-500 font-bold ml-auto cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Math Preview Box */}
                  {numericAmount > 0 && (
                    <div className={`p-3 rounded-2xl border ${
                      type === DebtType.OWE_ME 
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60' 
                        : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                    }`}>
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-zinc-600 dark:text-zinc-400">Balance Effect:</span>
                        <span className={type === DebtType.OWE_ME ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}>
                          {type === DebtType.OWE_ME ? `+${formatCurrency(numericAmount, currency)} (Receivable)` : `−${formatCurrency(numericAmount, currency)} (Payable)`}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 3: DETAILS & SCHEDULE */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: directionSlide === 'forward' ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: directionSlide === 'forward' ? -16 : 16 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-zinc-500" />
                      Step 3: Schedule & Optional Details
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Set a due date or add a short note for reference.
                    </p>
                  </div>

                  {/* Due Date & Presets */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Due Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                    />

                    {/* Quick Due Date Presets */}
                    <div className="flex items-center gap-1.5 pt-0.5 overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setDueDate('')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          !dueDate ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        No Due Date
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDueDatePreset(7)}
                        className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                      >
                        In 7 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDueDatePreset(30)}
                        className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                      >
                        In 30 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickDueDatePreset('endOfMonth')}
                        className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                      >
                        End of Month
                      </button>
                    </div>
                  </div>

                  {/* Reason / Title */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Reason / Note (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dinner split, Freelance project, Rent, Car loan"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 placeholder:text-zinc-400"
                    />
                  </div>

                  {/* Category & Priority Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none"
                      >
                        <option value="personal">Personal</option>
                        <option value="business">Business</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone & Account / CCP */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Phone
                      </label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Account / CCP #
                      </label>
                      <input
                        type="text"
                        placeholder="Optional"
                        value={ccpNumber}
                        onChange={(e) => setCcpNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: directionSlide === 'forward' ? 16 : -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: directionSlide === 'forward' ? -16 : 16 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Step 4: Review & Confirm
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Verify transaction details before saving.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-700/60">
                      <div>
                        <span className="text-[10px] font-black text-zinc-400 uppercase">Contact</span>
                        <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{contactName}</h4>
                        {contactInfo && <p className="text-[11px] text-zinc-500">{contactInfo}</p>}
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] font-black text-zinc-400 uppercase">Direction</span>
                        <span className={`inline-block text-xs font-black px-2.5 py-0.5 rounded-full ${
                          type === DebtType.OWE_ME
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}>
                          {type === DebtType.OWE_ME ? 'Owed to Me' : 'I Owe'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-bold text-zinc-500">Principal Amount:</span>
                      <span className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(numericAmount, currency)}
                      </span>
                    </div>

                    {dueDate && (
                      <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                        <span className="font-bold text-zinc-500">Due Date:</span>
                        <span className="font-extrabold text-zinc-900 dark:text-zinc-100">{dueDate}</span>
                      </div>
                    )}

                    {description && (
                      <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                        <span className="font-bold text-zinc-500">Note:</span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{description}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs py-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                      <span className="font-bold text-zinc-500">Category:</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 capitalize">{category} ({priority} priority)</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wizard Footer with Next / Back Controls */}
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center gap-2.5">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 ? !contactName.trim() : currentStep === 2 ? numericAmount <= 0 : false}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black text-xs hover:bg-zinc-800 dark:hover:bg-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <span>
                  {currentStep === 1 ? 'Next: Amount & Direction' : currentStep === 2 ? 'Next: Date & Details' : 'Next: Review & Confirm'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                className={`flex-1 py-3.5 px-4 rounded-2xl text-white font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === DebtType.OWE_ME 
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' 
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{editingDebt ? 'Save Changes' : 'Confirm & Save Record'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
