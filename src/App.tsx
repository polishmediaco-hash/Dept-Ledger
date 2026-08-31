import React, { useState, useMemo, useEffect } from 'react';
import { 
  DebtItem, 
  TabFilter, 
  CategoryFilter, 
  PriorityFilter, 
  StatusFilter, 
  SortField, 
  SortOrder, 
  ViewMode 
} from './types';
import { 
  getDaysUntilDue, 
  getDaysElapsed, 
  getPriorityScore, 
  getDebtStatus,
} from './utils/dateUtils';
import { useFirebase } from './contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType, logout, testConnection } from './lib/firebase';
import { doc, setDoc, addDoc, collection, deleteDoc, updateDoc } from 'firebase/firestore';
import { AuthScreen } from './components/AuthScreen';
import { IPhoneStatusBar } from './components/IPhoneStatusBar';
import { IPhoneMainActions } from './components/IPhoneMainActions';
import { IPhoneBottomBar } from './components/IPhoneBottomBar';
import { FullBalanceSection } from './components/FullBalanceSection';
import { FilterBar } from './components/FilterBar';
import { DebtCard } from './components/DebtCard';
import { DebtTableView } from './components/DebtTableView';
import { DebtModal } from './components/DebtModal';
import { PaymentModal } from './components/PaymentModal';
import { DebtDetailModal } from './components/DebtDetailModal';
import { ReminderModal } from './components/ReminderModal';
import { PriorityAdvisorModal } from './components/PriorityAdvisorModal';
import { ExportImportModal } from './components/ExportImportModal';
import { FullBalanceModal } from './components/FullBalanceModal';
import { SettleDebtModal } from './components/SettleDebtModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Inbox, 
  SearchX, 
  Smartphone, 
  Download,
  DollarSign,
  LogOut,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const { user, loading, debts, currencyPreference: currency, setCurrencyPreference } = useFirebase();

  // Connection check
  React.useEffect(() => {
    if (user) {
      testConnection();
    }
  }, [user]);

  // iPhone View Tab Navigation
  const [activeNavTab, setActiveNavTab] = useState<'ledger' | 'balance' | 'settle' | 'advisor'>('ledger');
  const [isFrameEmulated] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if running in standalone mode (iOS or Android)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone || 
                               document.referrer.includes('android-app://');
    setIsStandalone(isInStandaloneMode);
    
    // Prevent scrolling bounce on iOS
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
  }, []);
  
  // Global Notification State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter & Sort States
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Modals
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentTargetDebt, setPaymentTargetDebt] = useState<DebtItem | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTargetDebt, setDetailTargetDebt] = useState<DebtItem | null>(null);

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderTargetDebt, setReminderTargetDebt] = useState<DebtItem | null>(null);

  const [isPriorityAdvisorOpen, setIsPriorityAdvisorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFullBalanceModalOpen, setIsFullBalanceModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

  // Counts & Calculations
  const activeDebts = useMemo(() => debts.filter(d => (d.amount - d.paidAmount) > 0.001), [debts]);
  
  const totalIOwe = useMemo(() => {
    return activeDebts
      .filter(d => d.direction === 'i_owe')
      .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  }, [activeDebts]);

  const totalOwedToMe = useMemo(() => {
    return activeDebts
      .filter(d => d.direction === 'owed_to_me')
      .reduce((sum, d) => sum + (d.amount - d.paidAmount), 0);
  }, [activeDebts]);

  const counts = useMemo(() => {
    return {
      all: debts.length,
      owedToMe: debts.filter(d => d.direction === 'owed_to_me').length,
      iOwe: debts.filter(d => d.direction === 'i_owe').length,
      personal: debts.filter(d => d.category === 'personal').length,
      business: debts.filter(d => d.category === 'business').length,
      overdue: activeDebts.filter(d => d.dueDate && getDaysUntilDue(d.dueDate) < 0).length,
    };
  }, [debts, activeDebts]);

  const urgentCount = useMemo(() => {
    return activeDebts.filter(d => d.priority === 'urgent').length;
  }, [activeDebts]);

  // Filter & Sort Logic
  const filteredAndSortedDebts = useMemo(() => {
    let result = [...debts].filter(debt => {
      // 1. Direction Tab
      if (tabFilter !== 'all' && debt.direction !== tabFilter) {
        return false;
      }

      // 2. Category
      if (categoryFilter !== 'all' && debt.category !== categoryFilter) {
        return false;
      }

      // 3. Priority
      if (priorityFilter !== 'all' && debt.priority !== priorityFilter) {
        return false;
      }

      // 4. Status
      if (statusFilter !== 'all') {
        const debtStatus = getDebtStatus(debt);
        if (statusFilter === 'overdue' && debtStatus !== 'overdue') return false;
        if (statusFilter === 'settled' && debtStatus !== 'settled') return false;
        if (statusFilter === 'partially_paid' && debtStatus !== 'partially_paid') return false;
        if (statusFilter === 'active' && debtStatus === 'settled') return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = debt.contact.name.toLowerCase().includes(q);
        const companyMatch = (debt.contact.company || '').toLowerCase().includes(q);
        const titleMatch = (debt.title || '').toLowerCase().includes(q);
        const notesMatch = (debt.notes || '').toLowerCase().includes(q);
        const tagsMatch = (debt.tags || []).some(t => t.toLowerCase().includes(q));
        const emailPhoneMatch = (debt.contact.email || '').toLowerCase().includes(q) || (debt.contact.phone || '').includes(q);
        
        if (!nameMatch && !companyMatch && !titleMatch && !notesMatch && !tagsMatch && !emailPhoneMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'priority') {
        comparison = getPriorityScore(a) - getPriorityScore(b);
      } else if (sortField === 'dueDate') {
        const dueA = a.dueDate ? new Date(a.dueDate + 'T00:00:00').getTime() : 9999999999999;
        const dueB = b.dueDate ? new Date(b.dueDate + 'T00:00:00').getTime() : 9999999999999;
        comparison = dueB - dueA;
      } else if (sortField === 'duration') {
        comparison = getDaysElapsed(a.startDate) - getDaysElapsed(b.startDate);
      } else if (sortField === 'balance') {
        const balA = a.amount - a.paidAmount;
        const balB = b.amount - b.paidAmount;
        comparison = balA - balB;
      } else if (sortField === 'startDate') {
        const startA = new Date(a.startDate + 'T00:00:00').getTime();
        const startB = new Date(b.startDate + 'T00:00:00').getTime();
        comparison = startA - startB;
      } else if (sortField === 'name') {
        comparison = a.contact.name.localeCompare(b.contact.name);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [debts, tabFilter, categoryFilter, priorityFilter, statusFilter, searchQuery, sortField, sortOrder]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  // Auth screen
  if (!user) {
    return <AuthScreen />;
  }

  // Actions
  const handleSaveDebt = async (debtData: Omit<DebtItem, 'id' | 'createdAt' | 'updatedAt' | 'payments'> & { id?: string }) => {
    if (!user) return;
    const path = `users/${user.uid}/debts`;
    try {
      console.log('App: Attempting to save debt. Path:', path, 'Data:', debtData);
      if (debtData.id) {
        const { id, ...updateData } = debtData;
        const docRef = doc(db, path, id);
        await updateDoc(docRef, {
          ...updateData,
          updatedAt: new Date().toISOString(),
        });
        setNotification({ message: 'Record updated successfully', type: 'success' });
      } else {
        const colRef = collection(db, path);
        // Clean the data: remove id and any potential undefined fields
        const cleanedData = JSON.parse(JSON.stringify(debtData));
        delete cleanedData.id;

        const newDebt = {
          ...cleanedData,
          payments: cleanedData.paidAmount > 0 ? [
            {
              id: 'pay-' + Date.now(),
              amount: cleanedData.paidAmount,
              date: cleanedData.startDate,
              note: 'Initial deposit / payment',
              paymentMethod: 'Initial Deposit',
              createdAt: new Date().toISOString(),
            }
          ] : [],
          ownerId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        console.log('App: Final payload for addDoc:', newDebt);
        const result = await addDoc(colRef, newDebt);
        console.log('App: Record successfully created with ID:', result.id);
        setNotification({ message: 'New record created successfully', type: 'success' });
      }
    } catch (error: any) {
      console.error('App: handleSaveDebt CRITICAL error:', error);
      console.error('App: Error code:', error?.code);
      console.error('App: Error message:', error?.message);
      
      const friendlyMessage = error?.code === 'permission-denied' 
        ? 'Permission Denied: Database rules blocked this save.' 
        : `Cloud Error: ${error?.message || 'Unknown error'}`;
        
      setNotification({ message: `Critical: ${friendlyMessage}`, type: 'error' });
      handleFirestoreError(error, debtData.id ? OperationType.UPDATE : OperationType.CREATE, path);
      throw error; 
    }
  };

  const handleDeleteDebt = async (debtId: string) => {
    if (!user) return;
    if (confirm('Are you sure you want to delete this debt record?')) {
      const path = `users/${user.uid}/debts/${debtId}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const handleQuickSettle = async (debt: DebtItem) => {
    if (!user) return;
    const isCurrentlySettled = (debt.amount - debt.paidAmount) <= 0.001;
    const path = `users/${user.uid}/debts/${debt.id}`;
    try {
      if (isCurrentlySettled) {
        await updateDoc(doc(db, path), {
          paidAmount: 0,
          payments: [],
          updatedAt: new Date().toISOString(),
        });
      } else {
        const remaining = debt.amount - debt.paidAmount;
        const fullPayment = {
          id: 'pay-' + Date.now(),
          amount: remaining,
          date: new Date().toISOString().slice(0, 10),
          note: 'Marked as settled in full',
          paymentMethod: 'Settled',
          createdAt: new Date().toISOString(),
        };
        await updateDoc(doc(db, path), {
          paidAmount: debt.amount,
          payments: [...(debt.payments || []), fullPayment],
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleAddPayment = async (debtId: string, payment: {
    amount: number;
    date: string;
    note: string;
    paymentMethod: string;
  }) => {
    if (!user) return;
    const path = `users/${user.uid}/debts/${debtId}`;
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const newRecord = {
      id: 'pay-' + Date.now(),
      amount: payment.amount,
      date: payment.date,
      note: payment.note,
      paymentMethod: payment.paymentMethod,
      createdAt: new Date().toISOString(),
    };

    try {
      const newPaid = Math.min(debt.amount, debt.paidAmount + payment.amount);
      const updatedDebtData = {
        paidAmount: newPaid,
        payments: [...(debt.payments || []), newRecord],
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, path), updatedDebtData);
      
      if (detailTargetDebt && detailTargetDebt.id === debtId) {
        setDetailTargetDebt({ ...debt, ...updatedDebtData });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleDeletePaymentRecord = async (debtId: string, paymentId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/debts/${debtId}`;
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const targetPayment = (debt.payments || []).find(p => p.id === paymentId);
    const deducted = targetPayment ? targetPayment.amount : 0;
    const newPayments = (debt.payments || []).filter(p => p.id !== paymentId);
    const newPaid = Math.max(0, debt.paidAmount - deducted);

    try {
      const updatedDebtData = {
        paidAmount: newPaid,
        payments: newPayments,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, path), updatedDebtData);

      if (detailTargetDebt && detailTargetDebt.id === debtId) {
        setDetailTargetDebt({ ...debt, ...updatedDebtData });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const handleBottomTabSelect = (tab: 'ledger' | 'balance' | 'settle' | 'advisor') => {
    setActiveNavTab(tab);
    if (tab === 'balance') {
      setIsFullBalanceModalOpen(true);
    } else if (tab === 'settle') {
      setIsSettleModalOpen(true);
    } else if (tab === 'advisor') {
      setIsPriorityAdvisorOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white overflow-hidden">
      
      {/* iPhone Device Wrapper - Seamless on Mobile */}
      <div className={`w-full h-full sm:h-auto ${isStandalone ? '' : isFrameEmulated ? 'max-w-[430px] sm:my-3' : 'max-w-md'} bg-zinc-50 flex flex-col min-h-screen ${isStandalone ? '' : 'sm:min-h-[880px] sm:max-h-[92vh] sm:rounded-[44px] shadow-2xl border-0 sm:border-8 sm:border-zinc-800'} overflow-hidden relative ring-1 ring-zinc-900/10`}>
        
        {/* Status Bar for PWA/Mobile look */}
        <IPhoneStatusBar urgentCount={urgentCount} />

        {/* iOS Navigation Header */}
        <header className="px-4 py-3 bg-white/90 backdrop-blur-md border-b border-zinc-200/70 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-zinc-900 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-zinc-900 tracking-tight leading-tight">
                Debt Ledger
              </h1>
              <p className="text-[10px] text-zinc-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Currency picker */}
            <select
              value={currency}
              onChange={(e) => setCurrencyPreference(e.target.value)}
              className="bg-zinc-100 active:bg-zinc-200 text-zinc-800 text-[11px] font-bold rounded-lg px-2 py-1 outline-none cursor-pointer border border-zinc-200"
            >
              <option value="DZD">DZD (د.ج)</option>
              <option value="$">$ (USD)</option>
              <option value="€">€ (EUR)</option>
              <option value="£">£ (GBP)</option>
              <option value="¥">¥ (JPY)</option>
              <option value="₹">₹ (INR)</option>
              <option value="CHF">CHF</option>
              <option value="zł">zł (PLN)</option>
              <option value="kr">kr (SEK)</option>
              <option value="CAD">CAD</option>
              <option value="R$">BRL (R$)</option>
            </select>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-zinc-500 active:text-red-600 active:bg-red-50 transition-colors active:scale-95"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Backup Export */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="p-1.5 rounded-lg text-zinc-500 active:text-zinc-900 active:bg-zinc-200/60 transition-colors active:scale-95"
              title="Backup / Export"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable iPhone Main Content Area */}
        <main className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3.5 pb-6">
          
          {/* 3 Core Primary Action Buttons: Add Debt, Settle Debt, Full Balance */}
          <IPhoneMainActions
            onOpenAddModal={() => {
              setEditingDebt(null);
              setIsDebtModalOpen(true);
            }}
            onOpenSettleModal={() => setIsSettleModalOpen(true)}
            onOpenFullBalance={() => setIsFullBalanceModalOpen(true)}
            unsettledCount={activeDebts.length}
            totalIOwe={totalIOwe}
            totalOwedToMe={totalOwedToMe}
            currency={currency}
          />

          {/* Full Balance 2-Column Inline View (When Balance Tab is Active) */}
          {activeNavTab === 'balance' && (
            <FullBalanceSection
              debts={debts}
              currency={currency}
              onQuickSettle={handleQuickSettle}
              onSelectDebt={(d) => {
                setDetailTargetDebt(d);
                setIsDetailModalOpen(true);
              }}
              onOpenAddModal={() => {
                setEditingDebt(null);
                setIsDebtModalOpen(true);
              }}
            />
          )}

          {/* Filter & Search Controls */}
          <FilterBar
            tabFilter={tabFilter}
            setTabFilter={setTabFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortField={sortField}
            setSortField={setSortField}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            counts={counts}
          />

          {/* Debts List */}
          {filteredAndSortedDebts.length > 0 ? (
            <div className="space-y-3">
              {filteredAndSortedDebts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  currency={currency}
                  onRecordPayment={(d) => {
                    setPaymentTargetDebt(d);
                    setIsPaymentModalOpen(true);
                  }}
                  onViewDetails={(d) => {
                    setDetailTargetDebt(d);
                    setIsDetailModalOpen(true);
                  }}
                  onEditDebt={(d) => {
                    setEditingDebt(d);
                    setIsDebtModalOpen(true);
                  }}
                  onDeleteDebt={handleDeleteDebt}
                  onQuickSettle={handleQuickSettle}
                  onOpenReminder={(d) => {
                    setReminderTargetDebt(d);
                    setIsReminderModalOpen(true);
                  }}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white border border-zinc-200/90 rounded-2xl p-8 text-center shadow-2xs my-4">
              <div className="h-10 w-10 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-2">
                {searchQuery ? <SearchX className="w-5 h-5" /> : <Inbox className="w-5 h-5" />}
              </div>
              <h3 className="text-xs font-bold text-zinc-900">
                {searchQuery ? 'No matching entries found' : 'No records yet'}
              </h3>
              <p className="text-[11px] text-zinc-500 mt-1 mb-3">
                {searchQuery
                  ? `No financial records matched "${searchQuery}".`
                  : 'Tap "Add Debt" above to record who owes you or who you owe.'}
              </p>
              <button
                onClick={() => {
                  setEditingDebt(null);
                  setIsDebtModalOpen(true);
                }}
                className="px-4 py-2 bg-zinc-900 active:bg-zinc-800 text-white font-bold rounded-xl text-xs transition-all shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add First Debt</span>
              </button>
            </div>
          )}
        </main>

        {/* iOS Native-Style Bottom Tab Bar */}
        <IPhoneBottomBar
          activeTab={activeNavTab}
          onSelectTab={handleBottomTabSelect}
          onOpenAddModal={() => {
            setEditingDebt(null);
            setIsDebtModalOpen(true);
          }}
          unsettledCount={activeDebts.length}
          urgentCount={urgentCount}
        />

        {/* Global Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 50, x: '-50%' }}
              className={`fixed bottom-24 left-1/2 px-4 py-2.5 rounded-full shadow-2xl z-[200] flex items-center gap-2 border whitespace-nowrap ${
                notification.type === 'success' 
                  ? 'bg-emerald-900 border-emerald-800 text-emerald-100' 
                  : 'bg-rose-900 border-rose-800 text-rose-100'
              }`}
            >
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-xs font-bold">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Modals & iOS Sheets */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setEditingDebt(null);
        }}
        onSave={handleSaveDebt}
        editingDebt={editingDebt}
        currency={currency}
      />

      <SettleDebtModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        debts={debts}
        currency={currency}
        onQuickSettle={handleQuickSettle}
        onRecordPayment={(d) => {
          setPaymentTargetDebt(d);
          setIsPaymentModalOpen(true);
        }}
        onSelectDebt={(d) => {
          setDetailTargetDebt(d);
          setIsDetailModalOpen(true);
        }}
      />

      <FullBalanceModal
        isOpen={isFullBalanceModalOpen}
        onClose={() => setIsFullBalanceModalOpen(false)}
        debts={debts}
        currency={currency}
        onQuickSettle={handleQuickSettle}
        onSelectDebt={(d) => {
          setDetailTargetDebt(d);
          setIsDetailModalOpen(true);
        }}
        onOpenAddModal={() => {
          setIsFullBalanceModalOpen(false);
          setEditingDebt(null);
          setIsDebtModalOpen(true);
        }}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentTargetDebt(null);
        }}
        debt={paymentTargetDebt}
        currency={currency}
        onAddPayment={handleAddPayment}
      />

      <DebtDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailTargetDebt(null);
        }}
        debt={detailTargetDebt}
        currency={currency}
        onRecordPayment={(d) => {
          setPaymentTargetDebt(d);
          setIsPaymentModalOpen(true);
        }}
        onEditDebt={(d) => {
          setEditingDebt(d);
          setIsDebtModalOpen(true);
        }}
        onDeleteDebt={(id) => {
          handleDeleteDebt(id);
          setIsDetailModalOpen(false);
        }}
        onQuickSettle={handleQuickSettle}
        onOpenReminder={(d) => {
          setReminderTargetDebt(d);
          setIsReminderModalOpen(true);
        }}
        onDeletePaymentRecord={handleDeletePaymentRecord}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setReminderTargetDebt(null);
        }}
        debt={reminderTargetDebt}
        currency={currency}
      />

      <PriorityAdvisorModal
        isOpen={isPriorityAdvisorOpen}
        onClose={() => setIsPriorityAdvisorOpen(false)}
        debts={debts}
        currency={currency}
        onRecordPayment={(d) => {
          setPaymentTargetDebt(d);
          setIsPaymentModalOpen(true);
        }}
        onViewDetails={(d) => {
          setDetailTargetDebt(d);
          setIsDetailModalOpen(true);
        }}
      />

      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        debts={debts}
        onImportData={async (imported) => {
          if (!user) return;
          const path = `users/${user.uid}/debts`;
          for (const item of imported) {
            try {
              const { id, ...rest } = item;
              await addDoc(collection(db, path), { ...rest, ownerId: user.uid });
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, path);
            }
          }
        }}
        onResetSampleData={() => {
          // In cloud mode, maybe we don't want to reset sample data or we do it by adding docs?
          // Let's just leave it for now or implement as adding sample docs
        }}
        onClearAllData={async () => {
          if (!user) return;
          for (const d of debts) {
            await deleteDoc(doc(db, `users/${user.uid}/debts/${d.id}`));
          }
        }}
      />
    </div>
  );
}
