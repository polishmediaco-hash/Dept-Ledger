import React from 'react';
import { 
  TabFilter, 
  CategoryFilter, 
  PriorityFilter, 
  StatusFilter, 
  SortField, 
  SortOrder, 
  ViewMode 
} from '../types';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  X,
  Briefcase,
  User,
  AlertTriangle,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface FilterBarProps {
  tabFilter: TabFilter;
  setTabFilter: (tab: TabFilter) => void;
  categoryFilter: CategoryFilter;
  setCategoryFilter: (cat: CategoryFilter) => void;
  priorityFilter: PriorityFilter;
  setPriorityFilter: (prio: PriorityFilter) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (status: StatusFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: SortField;
  setSortField: (field: SortField) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  counts: {
    all: number;
    owedToMe: number;
    iOwe: number;
    personal: number;
    business: number;
    overdue: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  tabFilter,
  setTabFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
  counts,
}) => {
  const hasActiveFilters = 
    categoryFilter !== 'all' || 
    priorityFilter !== 'all' || 
    statusFilter !== 'all' || 
    searchQuery.trim() !== '';

  const clearFilters = () => {
    setCategoryFilter('all');
    setPriorityFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="bg-white border border-zinc-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs mb-5 space-y-3">
      {/* Top Row: Primary Tabs & Search & View Mode */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Main Tabs (All, Owed to Me, I Owe) */}
        <div className="flex items-center p-1 bg-zinc-100/90 rounded-xl border border-zinc-200/80 overflow-x-auto">
          <button
            id="tab-filter-all"
            onClick={() => setTabFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              tabFilter === 'all'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 active:text-zinc-900'
            }`}
          >
            All Items ({counts.all})
          </button>

          <button
            id="tab-filter-owed-to-me"
            onClick={() => setTabFilter('owed_to_me')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 ${
              tabFilter === 'owed_to_me'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-600 active:text-emerald-700'
            }`}
          >
            <span>Owed to Me ({counts.owedToMe})</span>
          </button>

          <button
            id="tab-filter-i-owe"
            onClick={() => setTabFilter('i_owe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 active:scale-95 ${
              tabFilter === 'i_owe'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-zinc-600 active:text-rose-700'
            }`}
          >
            <span>I Owe ({counts.iOwe})</span>
          </button>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-input"
              type="text"
              placeholder="Search by name, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-400 rounded-xl text-xs text-zinc-900 outline-none transition-all placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 active:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Cards / Table toggle */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors active:scale-95 ${
                viewMode === 'cards'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 active:text-zinc-800'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors active:scale-95 ${
                viewMode === 'table'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 active:text-zinc-800'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Quick Filters & Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 text-xs text-zinc-600">
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">Type:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-400"
            >
              <option value="all">All Types</option>
              <option value="personal">Personal only</option>
              <option value="business">Business only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-400"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Unpaid)</option>
              <option value="overdue">Overdue ({counts.overdue})</option>
              <option value="settled">Settled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-400"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent only</option>
              <option value="high">High only</option>
              <option value="medium">Medium only</option>
              <option value="low">Low only</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[11px] text-rose-600 active:text-rose-800 font-semibold px-2 py-0.5 rounded-md active:bg-rose-50 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset filters</span>
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-[11px] text-zinc-400 font-medium">Sort:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-xs text-zinc-800 font-medium outline-none cursor-pointer focus:border-zinc-400"
          >
            <option value="priority">Payoff Priority / Urgency</option>
            <option value="dueDate">Due Date (Deadline)</option>
            <option value="duration">Aging Duration (Days Owed)</option>
            <option value="balance">Remaining Balance</option>
            <option value="name">Contact Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 rounded-lg border border-zinc-200 bg-zinc-50 active:bg-zinc-100 text-zinc-700 transition-colors active:scale-95"
            title={`Sort direction: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
