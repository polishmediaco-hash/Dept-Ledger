import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  itemDetails?: {
    name?: string;
    amount?: string;
    category?: string;
  };
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = 'Are you sure? This action cannot be undone and will permanently remove this data.',
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  variant = 'danger',
  itemDetails,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-zinc-950/60 dark:bg-black/80 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0"
          />

          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[28px] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 z-[251] p-6 text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon */}
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
              variant === 'danger'
                ? 'bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                : 'bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
            }`}>
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed px-2">
                {description}
              </p>
            </div>

            {/* Optional Item Highlight */}
            {itemDetails && (
              <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-3 border border-zinc-100 dark:border-zinc-800 text-left text-xs space-y-1">
                {itemDetails.name && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">Contact:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{itemDetails.name}</span>
                  </div>
                )}
                {itemDetails.amount && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">Amount:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{itemDetails.amount}</span>
                  </div>
                )}
                {itemDetails.category && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400 font-medium">Category:</span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300 capitalize">{itemDetails.category}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer active:scale-95"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 py-3 rounded-2xl font-bold text-xs text-white shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                  variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmText}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
