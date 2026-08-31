import React from 'react';
import { 
  Receipt, 
  Columns, 
  Plus, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';

interface IPhoneBottomBarProps {
  activeTab: 'ledger' | 'balance' | 'settle' | 'advisor';
  onSelectTab: (tab: 'ledger' | 'balance' | 'settle' | 'advisor') => void;
  onOpenAddModal: () => void;
  unsettledCount: number;
  urgentCount: number;
}

export const IPhoneBottomBar: React.FC<IPhoneBottomBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  unsettledCount,
  urgentCount,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
        
        {/* Tab 1: Ledger */}
        <button
          onClick={() => onSelectTab('ledger')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-110 ${
            activeTab === 'ledger' ? 'text-zinc-950 font-bold' : 'text-zinc-400 active:text-zinc-600 font-medium'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Ledger</span>
        </button>

        {/* Tab 2: Full Balance (2 Columns) */}
        <button
          onClick={() => onSelectTab('balance')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-110 ${
            activeTab === 'balance' ? 'text-indigo-600 font-bold' : 'text-zinc-400 active:text-zinc-600 font-medium'
          }`}
        >
          <Columns className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Balance</span>
        </button>

        {/* Center Prominent Add Debt Button */}
        <div className="flex-1 flex justify-center -mt-5">
          <button
            onClick={onOpenAddModal}
            className="h-13 w-13 rounded-full bg-zinc-900 active:bg-zinc-800 text-white flex items-center justify-center shadow-lg border-3 border-zinc-50 active:scale-95 transition-transform"
            title="Add Debt"
          >
            <Plus className="w-6 h-6 text-emerald-400" />
          </button>
        </div>

        {/* Tab 4: Settle Debt */}
        <button
          onClick={() => onSelectTab('settle')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative active:scale-110 ${
            activeTab === 'settle' ? 'text-emerald-600 font-bold' : 'text-zinc-400 active:text-zinc-600 font-medium'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Settle</span>
          {unsettledCount > 0 && (
            <span className="absolute top-0.5 right-2 h-4 min-w-[16px] px-1 rounded-full bg-emerald-600 text-white text-[9px] font-extrabold flex items-center justify-center">
              {unsettledCount}
            </span>
          )}
        </button>

        {/* Tab 5: Advisor */}
        <button
          onClick={() => onSelectTab('advisor')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative active:scale-110 ${
            activeTab === 'advisor' ? 'text-amber-600 font-bold' : 'text-zinc-400 active:text-zinc-600 font-medium'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Advisor</span>
          {urgentCount > 0 && (
            <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-rose-500" />
          )}
        </button>

      </div>

      {/* iOS Home Bar Indicator */}
      <div className="pb-1.5 pt-0.5 flex justify-center">
        <div className="w-32 h-1 rounded-full bg-zinc-400/80" />
      </div>
    </div>
  );
};
