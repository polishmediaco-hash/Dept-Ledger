import React, { useState, useEffect } from 'react';
import { DebtItem } from '../types';
import { 
  formatCurrency, 
  formatDate, 
  formatDurationElapsed, 
  getDaysUntilDue 
} from '../utils/dateUtils';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MessageSquare, 
  Copy, 
  Check, 
  Mail, 
  Share2
} from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: DebtItem | null;
  currency: string;
}

type Tone = 'friendly' | 'business' | 'milestone' | 'urgent';

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  debt,
  currency,
}) => {
  const [tone, setTone] = useState<Tone>('friendly');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!debt) return;
    const balance = Math.max(0, debt.amount - debt.paidAmount);
    const balanceFormatted = formatCurrency(balance, currency);
    const dueDateFormatted = formatDate(debt.dueDate);
    const daysUntil = getDaysUntilDue(debt.dueDate);
    const duration = formatDurationElapsed(debt.startDate);
    const name = debt.contact.name || 'there';
    const payMethod = debt.contact.paymentDetails ? `\n\nPayment can be sent via: ${debt.contact.paymentDetails}` : '';

    let text = '';

    if (tone === 'friendly') {
      text = `Hey ${name}! 😊 Hope you're having a great week. Quick friendly reminder regarding the ${debt.title} balance of ${balanceFormatted} (outstanding for ${duration}). Whenever you get a chance to settle this, I'd really appreciate it!${payMethod}\n\nThanks so much!`;
    } else if (tone === 'business') {
      text = `Hello ${name},\n\nThis is a courtesy reminder regarding the outstanding balance for "${debt.title}".\n\n- Amount Due: ${balanceFormatted}\n- Due Date: ${dueDateFormatted}\n- Status: ${daysUntil < 0 ? `Overdue by ${Math.abs(daysUntil)} days` : `Due on ${dueDateFormatted}`}${payMethod}\n\nPlease let me know once processed or if you need any additional invoice copies.\n\nBest regards,`;
    } else if (tone === 'milestone') {
      text = `Hi ${name}, checking in on our agreed schedule for "${debt.title}". As discussed, the remaining balance of ${balanceFormatted} is scheduled for ${dueDateFormatted}.${payMethod}\n\nPlease let me know if everything is on track. Thank you!`;
    } else if (tone === 'urgent') {
      text = `URGENT: Outstanding Balance Notice\n\nDear ${name},\n\nThe balance of ${balanceFormatted} for "${debt.title}" is currently ${daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue (due ${dueDateFormatted})` : `due today (${dueDateFormatted})`}.\n\nPlease arrange payment at your earliest convenience.${payMethod}\n\nThank you for your prompt attention to this matter.`;
    }

    setCustomMessage(text);
  }, [debt, tone, currency]);

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    if (!debt) return;
    const phone = (debt.contact.phone || '').replace(/[^0-9]/g, '');
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(customMessage)}`
      : `https://wa.me/?text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank');
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
            className="fixed bottom-0 left-0 right-0 z-[101] bg-zinc-950 text-white rounded-t-[32px] shadow-2xl overflow-hidden flex flex-col mx-auto max-w-[500px]"
          >
            {/* iOS Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black leading-tight">Reminder Generator</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    To {debt.contact.name} • {formatCurrency(debt.amount - debt.paidAmount, currency)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Tone Selection */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Message Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['friendly', 'business', 'milestone', 'urgent'] as Tone[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`py-3 px-4 rounded-2xl border text-xs font-black capitalize transition-all active:scale-95 ${
                        tone === t
                          ? 'bg-zinc-800 border-zinc-700 text-white shadow-lg'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Box */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Message Preview</label>
                <textarea
                  rows={6}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-3xl text-sm font-bold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 active:scale-95 transition-all group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${copied ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400 group-active:bg-zinc-700'}`}>
                    {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Copy Message</span>
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 active:scale-95 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-active:bg-emerald-500/20">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Send WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-zinc-900 border-t border-zinc-800 shrink-0">
              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-white text-zinc-950 font-bold shadow-lg active:scale-95 transition-transform"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
