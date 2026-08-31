import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles } from 'lucide-react';

interface IPhoneStatusBarProps {
  urgentCount?: number;
}

export const IPhoneStatusBar: React.FC<IPhoneStatusBarProps> = ({ urgentCount = 0 }) => {
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const is12Hour = true;
      if (is12Hour) {
        hours = hours % 12 || 12;
      }
      setTimeStr(`${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full pt-[max(0.625rem,env(safe-area-inset-top))] pb-1 px-7 flex items-center justify-between text-zinc-900 select-none z-40 bg-zinc-50/90 backdrop-blur-md">
      {/* Time */}
      <span className="text-[13px] font-bold tracking-tight text-zinc-900">
        {timeStr}
      </span>

      {/* Dynamic Island Pill */}
      <div className="h-5 px-3 rounded-full bg-black text-white flex items-center justify-center gap-1.5 shadow-xs">
        <div className={`h-2 w-2 rounded-full ${urgentCount > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
        <span className="text-[9px] font-bold tracking-wide">
          {urgentCount > 0 ? `${urgentCount} Urgent` : 'Ledger Active'}
        </span>
      </div>

      {/* Status Icons */}
      <div className="flex items-center gap-1.5 text-zinc-800">
        <span className="text-[10px] font-extrabold tracking-tighter">5G</span>
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5">
          <div className="w-5 h-2.5 rounded-[4px] border border-zinc-700 p-0.5 flex items-center">
            <div className="h-full w-3.5 rounded-[2px] bg-zinc-900" />
          </div>
          <div className="w-0.5 h-1 rounded-r bg-zinc-600" />
        </div>
      </div>
    </div>
  );
};
