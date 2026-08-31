import React from 'react';
import { 
  SortField, 
  SortOrder 
} from '../types';
import { 
  Search, 
  ArrowUpDown, 
  X,
  SlidersHorizontal
} from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  directionFilter?: 'all' | 'owed_to_me' | 'i_owe';
  setDirectionFilter?: (filter: 'all' | 'owed_to_me' | 'i_owe') => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  directionFilter = 'all',
  setDirectionFilter,
}) => {
  return (
    <div className="space-y-2.5 mb-3">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
        </div>
        <input
          id="search-input"
          type="text"
          placeholder="Search by contact or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-600 text-zinc-900 dark:text-zinc-100 transition-all shadow-2xs placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter & Sort Controls Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Direction Segmented Filter */}
        {setDirectionFilter && (
          <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-xl text-[11px] font-semibold shrink-0">
            <button
              onClick={() => setDirectionFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                directionFilter === 'all' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDirectionFilter('owed_to_me')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                directionFilter === 'owed_to_me' ? 'theme-rec-badge font-bold shadow-2xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              + Owed Me
            </button>
            <button
              onClick={() => setDirectionFilter('i_owe')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                directionFilter === 'i_owe' ? 'theme-pay-badge font-bold shadow-2xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              − I Owe
            </button>
          </div>
        )}

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-2.5 py-1 rounded-xl shadow-2xs text-xs font-bold text-zinc-700 dark:text-zinc-300">
            <SlidersHorizontal className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="bg-transparent text-zinc-900 dark:text-zinc-100 text-xs font-bold outline-none cursor-pointer pr-1"
            >
              <option value="priority" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Priority</option>
              <option value="dueDate" className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">Due Date</option>
            </select>
          </div>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 shadow-2xs active:scale-95 transition-all cursor-pointer"
            title="Toggle sort direction"
          >
            <ArrowUpDown className={`w-3.5 h-3.5 transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

