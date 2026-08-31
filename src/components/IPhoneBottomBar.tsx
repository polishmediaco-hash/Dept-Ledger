import React from 'react';
import { 
  Receipt, 
  BarChart3, 
  Plus, 
  History
} from 'lucide-react';

interface IPhoneBottomBarProps {
  activeTab: 'ledger' | 'balance' | 'history';
  onSelectTab: (tab: 'ledger' | 'balance' | 'history') => void;
  onOpenAddModal: () => void;
  urgentCount?: number;
}

export const IPhoneBottomBar: React.FC<IPhoneBottomBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  urgentCount = 0,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200/90 dark:border-zinc-800 shadow-xs pb-[env(safe-area-inset-bottom,0px)] transition-colors">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-1">
        
        {/* Tab 1: Ledger */}
        <button
          id="nav-tab-ledger"
          onClick={() => onSelectTab('ledger')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ledger' ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <Receipt className={`w-5 h-5 mb-0.5 ${activeTab === 'ledger' ? 'text-zinc-900 dark:text-zinc-100 stroke-[2.2]' : 'text-zinc-400 dark:text-zinc-500'}`} />
          <span className="text-[10px] tracking-tight">Ledger</span>
        </button>

        {/* Tab 2: Balance Breakdown */}
        <button
          id="nav-tab-balance"
          onClick={() => onSelectTab('balance')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'balance' ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <BarChart3 className={`w-5 h-5 mb-0.5 ${activeTab === 'balance' ? 'text-zinc-900 dark:text-zinc-100 stroke-[2.2]' : 'text-zinc-400 dark:text-zinc-500'}`} />
          <span className="text-[10px] tracking-tight">Balance</span>
        </button>

        {/* Center Add Record Button */}
        <div className="px-2 flex items-center justify-center shrink-0">
          <button
            id="nav-btn-add-record"
            onClick={onOpenAddModal}
            className="h-10 px-3.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 active:bg-zinc-800 dark:active:bg-zinc-200 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 flex items-center gap-1.5 font-semibold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="Add New Record"
          >
            <Plus className="w-4 h-4 text-zinc-200 dark:text-zinc-700" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Tab 3: History */}
        <button
          id="nav-tab-history"
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative cursor-pointer ${
            activeTab === 'history' ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
          }`}
        >
          <History className={`w-5 h-5 mb-0.5 ${activeTab === 'history' ? 'text-zinc-900 dark:text-zinc-100 stroke-[2.2]' : 'text-zinc-400 dark:text-zinc-500'}`} />
          <span className="text-[10px] tracking-tight">History</span>
          {urgentCount > 0 && (
            <span className="absolute top-1 right-6 h-1.5 w-1.5 rounded-full bg-rose-500" />
          )}
        </button>

      </div>
    </div>
  );
};


