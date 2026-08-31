import React, { useRef } from 'react';
import { DebtItem } from '../types';
import { exportToCSV, exportToJSON } from '../utils/storage';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  FileSpreadsheet, 
  FileCode
} from 'lucide-react';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  debts: DebtItem[];
  onImportData: (importedDebts: DebtItem[]) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  debts,
  onImportData,
  onResetSampleData,
  onClearAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImportData(parsed);
          onClose();
        }
      } catch (err) {
        console.error('Failed to parse the backup JSON file.');
      }
    };
    reader.readAsText(file);
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
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                  <Download className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black leading-tight">Data & Export</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Backup & Restore Management</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Export Area */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Export Options</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => exportToCSV(debts)}
                    className="p-4 bg-zinc-900 rounded-3xl border border-zinc-800 flex flex-col items-center gap-3 active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] font-black uppercase tracking-wider block">CSV Sheet</span>
                      <span className="text-[9px] font-bold text-zinc-500">Excel / Google</span>
                    </div>
                  </button>

                  <button
                    onClick={() => exportToJSON(debts)}
                    className="p-4 bg-zinc-900 rounded-3xl border border-zinc-800 flex flex-col items-center gap-3 active:scale-95 transition-transform"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-[11px] font-black uppercase tracking-wider block">JSON Backup</span>
                      <span className="text-[9px] font-bold text-zinc-500">Full Raw Data</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Import Area */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Restore Backup</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                  <Upload className="w-5 h-5 text-zinc-400" />
                  <span className="text-xs font-black uppercase tracking-widest">Restore from File</span>
                </button>
              </div>

              {/* Dangerous Area */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">Maintenance</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (window.confirm('Load sample data?')) {
                        onResetSampleData();
                        onClose();
                      }
                    }}
                    className="flex-1 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <RotateCcw className="w-4 h-4 text-zinc-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sample Data</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Delete ALL records forever?')) {
                        onClearAllData();
                        onClose();
                      }
                    }}
                    className="flex-1 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Clear All</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-zinc-900 border-t border-zinc-900 shrink-0">
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
