import React, { useState, useMemo, useEffect } from 'react';
import { 
  DebtItem, 
  TransactionType,
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
  formatCurrency,
} from './utils/dateUtils';
import { useFirebase } from './contexts/FirebaseContext';
import { db, handleFirestoreError, OperationType, logout } from './lib/firebase';
import { doc, setDoc, addDoc, collection, deleteDoc, updateDoc } from 'firebase/firestore';
import { AuthScreen } from './components/AuthScreen';
import { AppHeader } from './components/AppHeader';
import { IPhoneMainActions } from './components/IPhoneMainActions';
import { IPhoneBottomBar } from './components/IPhoneBottomBar';
import { FullBalanceSection } from './components/FullBalanceSection';
import { FilterBar } from './components/FilterBar';
import { DebtCard } from './components/DebtCard';
import { DebtTableView } from './components/DebtTableView';
import { DebtModal } from './components/DebtModal';
import { PaymentModal } from './components/PaymentModal';
import { DebtDetailModal } from './components/DebtDetailModal';
import { PriorityAdvisorModal } from './components/PriorityAdvisorModal';
import { ExportImportModal } from './components/ExportImportModal';
import { PaymentHistory } from './components/PaymentHistory';
import { ConfirmModal } from './components/ConfirmModal';
import confetti from 'canvas-confetti';
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
  CheckCircle2,
  History
} from 'lucide-react';

export default function App() {
  const { 
    user, 
    loading, 
    debts, 
    currencyPreference: currency, 
    setCurrencyPreference,
    isOnline,
    isSyncing,
    hasPendingWrites,
    setLocalDebtsOptimistic,
  } = useFirebase();

  // Dark / Night mode state & synchronization
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('ledger_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('ledger_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('ledger_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  // State for PWA standalone detection
  const [activeNavTab, setActiveNavTab] = useState<'ledger' | 'balance' | 'history'>('ledger');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect if running in standalone mode (iOS or Android)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                               (window.navigator as any).standalone || 
                               document.referrer.includes('android-app://');
    setIsStandalone(isInStandaloneMode);
    
    // Allow natural scrolling
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
    document.body.style.height = 'auto';
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
  const [paymentModalInitialMode, setPaymentModalInitialMode] = useState<TransactionType>('subtract');

  const openPaymentModal = (debt: DebtItem, mode: TransactionType = 'subtract') => {
    setPaymentTargetDebt(debt);
    setPaymentModalInitialMode(mode);
    setIsPaymentModalOpen(true);
  };

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailTargetDebt, setDetailTargetDebt] = useState<DebtItem | null>(null);

  const [isPriorityAdvisorOpen, setIsPriorityAdvisorOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [pendingDeleteDebt, setPendingDeleteDebt] = useState<DebtItem | null>(null);

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
        const emailPhoneMatch = (debt.contact.ccpNumber || '').toLowerCase().includes(q) || (debt.contact.phone || '').includes(q);
        
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
      if (debtData.id) {
        const { id, ...updateData } = debtData;
        const nowStr = new Date().toISOString();
        
        // Optimistic update to React state instantly
        setLocalDebtsOptimistic(prev => prev.map(item => 
          item.id === id ? { ...item, ...updateData, updatedAt: nowStr } as DebtItem : item
        ));

        const docRef = doc(db, path, id);
        await updateDoc(docRef, {
          ...updateData,
          updatedAt: nowStr,
        });
        setNotification({ 
          message: !isOnline ? 'Saved locally (will sync when online)' : 'Record updated successfully', 
          type: 'success' 
        });
      } else {
        const tempId = 'temp-' + Date.now();
        const nowStr = new Date().toISOString();
        const cleanedData = JSON.parse(JSON.stringify(debtData));
        delete cleanedData.id;

        const newDebtPayload: DebtItem = {
          ...cleanedData,
          id: tempId,
          payments: cleanedData.paidAmount > 0 ? [
            {
              id: 'pay-' + Date.now(),
              amount: cleanedData.paidAmount,
              date: cleanedData.startDate,
              note: 'Initial deposit / payment',
              paymentMethod: 'Initial Deposit',
              createdAt: nowStr,
            }
          ] : [],
          ownerId: user.uid,
          createdAt: nowStr,
          updatedAt: nowStr,
        };

        // Optimistic update to React state instantly
        setLocalDebtsOptimistic(prev => [newDebtPayload, ...prev]);

        const colRef = collection(db, path);
        const { id: _, ...firestorePayload } = newDebtPayload;
        const result = await addDoc(colRef, firestorePayload);

        // Replace tempId with actual firestore id
        setLocalDebtsOptimistic(prev => prev.map(item => 
          item.id === tempId ? { ...item, id: result.id } : item
        ));

        setNotification({ 
          message: !isOnline ? 'Created locally (will sync when online)' : 'New record created successfully', 
          type: 'success' 
        });
      }
    } catch (error: any) {
      console.warn('App: handleSaveDebt note:', error);
      if (!isOnline) {
        setNotification({ message: 'Saved to offline cache • Will sync when connected', type: 'success' });
      } else {
        handleFirestoreError(error, debtData.id ? OperationType.UPDATE : OperationType.CREATE, path);
      }
    }
  };

  const handleDeleteDebt = (debtId: string) => {
    const debt = debts.find(d => d.id === debtId);
    if (debt) {
      setPendingDeleteDebt(debt);
    }
  };

  const executeDeleteDebt = async (debtId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/debts/${debtId}`;
    try {
      // Optimistic delete
      setLocalDebtsOptimistic(prev => prev.filter(d => d.id !== debtId));
      if (detailTargetDebt && detailTargetDebt.id === debtId) {
        setIsDetailModalOpen(false);
        setDetailTargetDebt(null);
      }

      await deleteDoc(doc(db, path));
      setNotification({ 
        message: !isOnline ? 'Deleted locally (will sync when online)' : 'Debt record deleted', 
        type: 'success' 
      });
    } catch (error) {
      if (!isOnline) {
        setNotification({ message: 'Deleted locally • Will sync when online', type: 'success' });
      } else {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    }
  };

  const handleQuickSettle = async (debt: DebtItem) => {
    if (!user) return;
    const isCurrentlySettled = (debt.amount - debt.paidAmount) <= 0.001;
    const path = `users/${user.uid}/debts/${debt.id}`;
    const nowStr = new Date().toISOString();

    try {
      if (isCurrentlySettled) {
        const updatedData = {
          paidAmount: 0,
          payments: [],
          updatedAt: nowStr,
        };

        // Optimistic update
        setLocalDebtsOptimistic(prev => prev.map(d => 
          d.id === debt.id ? { ...d, ...updatedData } as DebtItem : d
        ));
        if (detailTargetDebt && detailTargetDebt.id === debt.id) {
          setDetailTargetDebt({ ...debt, ...updatedData } as DebtItem);
        }

        await updateDoc(doc(db, path), updatedData);
        setNotification({ message: 'Debt reopened', type: 'success' });
      } else {
        const remaining = debt.amount - debt.paidAmount;
        const fullPayment = {
          id: 'pay-' + Date.now(),
          amount: remaining,
          date: nowStr.slice(0, 10),
          note: 'Marked as settled in full',
          paymentMethod: 'Settled',
          createdAt: nowStr,
        };
        const updatedData = {
          paidAmount: debt.amount,
          payments: [...(debt.payments || []), fullPayment],
          updatedAt: nowStr,
        };

        // Optimistic update
        setLocalDebtsOptimistic(prev => prev.map(d => 
          d.id === debt.id ? { ...d, ...updatedData } as DebtItem : d
        ));
        if (detailTargetDebt && detailTargetDebt.id === debt.id) {
          setDetailTargetDebt({ ...debt, ...updatedData } as DebtItem);
        }

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }

        await updateDoc(doc(db, path), updatedData);
        setNotification({ message: 'Debt marked as fully settled! 🎉', type: 'success' });
      }
    } catch (error) {
      if (!isOnline) {
        setNotification({ message: 'Status updated locally', type: 'success' });
      } else {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const handleAddPayment = async (debtId: string, payment: {
    amount: number;
    date: string;
    note: string;
    paymentMethod: string;
    type?: TransactionType;
  }) => {
    if (!user) return;
    const path = `users/${user.uid}/debts/${debtId}`;
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const txType = payment.type || 'subtract';
    const nowStr = new Date().toISOString();
    const newRecord = {
      id: 'pay-' + Date.now(),
      amount: payment.amount,
      date: payment.date,
      note: payment.note,
      paymentMethod: payment.paymentMethod,
      type: txType,
      createdAt: nowStr,
    };

    try {
      let updatedDebtData: Partial<DebtItem>;
      if (txType === 'add') {
        const newAmount = debt.amount + payment.amount;
        updatedDebtData = {
          amount: newAmount,
          payments: [...(debt.payments || []), newRecord],
          updatedAt: nowStr,
        };
      } else {
        const newPaid = Math.min(debt.amount, debt.paidAmount + payment.amount);
        updatedDebtData = {
          paidAmount: newPaid,
          payments: [...(debt.payments || []), newRecord],
          updatedAt: nowStr,
        };
      }

      // Optimistic update
      setLocalDebtsOptimistic(prev => prev.map(d => 
        d.id === debtId ? { ...d, ...updatedDebtData } as DebtItem : d
      ));
      if (detailTargetDebt && detailTargetDebt.id === debtId) {
        setDetailTargetDebt({ ...debt, ...updatedDebtData } as DebtItem);
      }

      await updateDoc(doc(db, path), updatedDebtData);

      setNotification({
        message: txType === 'add'
          ? `Added ${formatCurrency(payment.amount, currency)} to loan principal`
          : `Recorded payment of ${formatCurrency(payment.amount, currency)}`,
        type: 'success'
      });
    } catch (error) {
      if (!isOnline) {
        setNotification({ message: 'Transaction recorded locally', type: 'success' });
      } else {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const handleDeletePaymentRecord = async (debtId: string, paymentId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/debts/${debtId}`;
    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    const targetPayment = (debt.payments || []).find(p => p.id === paymentId);
    const amountVal = targetPayment ? targetPayment.amount : 0;
    const isAddition = targetPayment?.type === 'add';
    const newPayments = (debt.payments || []).filter(p => p.id !== paymentId);
    const nowStr = new Date().toISOString();

    try {
      let updatedDebtData: Partial<DebtItem>;
      if (isAddition) {
        const newAmount = Math.max(debt.paidAmount, debt.amount - amountVal);
        updatedDebtData = {
          amount: newAmount,
          payments: newPayments,
          updatedAt: nowStr,
        };
      } else {
        const newPaid = Math.max(0, debt.paidAmount - amountVal);
        updatedDebtData = {
          paidAmount: newPaid,
          payments: newPayments,
          updatedAt: nowStr,
        };
      }

      // Optimistic update
      setLocalDebtsOptimistic(prev => prev.map(d => 
        d.id === debtId ? { ...d, ...updatedDebtData } as DebtItem : d
      ));
      if (detailTargetDebt && detailTargetDebt.id === debtId) {
        setDetailTargetDebt({ ...debt, ...updatedDebtData } as DebtItem);
      }

      await updateDoc(doc(db, path), updatedDebtData);
      setNotification({ message: 'Transaction entry removed', type: 'success' });
    } catch (error) {
      if (!isOnline) {
        setNotification({ message: 'Entry removed locally', type: 'success' });
      } else {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    }
  };

  const handleBottomTabSelect = (tab: 'ledger' | 'balance' | 'history') => {
    setActiveNavTab(tab);
  };

  return (
    <div className="h-dvh w-full bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-100 dark:selection:text-zinc-900 overflow-hidden transition-colors">
      
      {/* Main App Container */}
      <div className="w-full flex-1 flex flex-col max-w-md mx-auto bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden transition-colors">
        
        {/* Navigation Header with Logo, Quick Alerts, Currency, Export & Account */}
        <AppHeader
          user={user}
          currency={currency}
          onCurrencyChange={(curr) => setCurrencyPreference(curr)}
          onOpenExport={() => setIsExportModalOpen(true)}
          onOpenAdvisor={() => setIsPriorityAdvisorOpen(true)}
          onLogout={logout}
          urgentCount={urgentCount}
          isStandalone={isStandalone}
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          isOnline={isOnline}
          isSyncing={isSyncing}
          hasPendingWrites={hasPendingWrites}
        />

        {/* Scrollable iPhone Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-32 scroll-smooth">
          
          {/* Top Slim Balance Summary Bar with smooth collapse on tab switch */}
          <AnimatePresence initial={false}>
            {activeNavTab === 'ledger' && (
              <motion.div
                key="net-standing-bar"
                initial={{ opacity: 0, height: 0, scale: 0.98 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <IPhoneMainActions
                  onOpenFullBalance={() => setActiveNavTab('balance')}
                  totalIOwe={totalIOwe}
                  totalOwedToMe={totalOwedToMe}
                  currency={currency}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Switcher based on activeNavTab */}
          {activeNavTab === 'history' ? (
            <PaymentHistory debts={debts} currency={currency} />
          ) : activeNavTab === 'balance' ? (
            <FullBalanceSection
              debts={debts}
              currency={currency}
              onQuickSettle={handleQuickSettle}
              onRecordPayment={(d, mode) => openPaymentModal(d, mode || 'subtract')}
              onSelectDebt={(d) => {
                setDetailTargetDebt(d);
                setIsDetailModalOpen(true);
              }}
              onOpenAddModal={() => {
                setEditingDebt(null);
                setIsDebtModalOpen(true);
              }}
            />
          ) : (
            <>
              {/* Filter & Search Controls */}
              <FilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortField={sortField}
                setSortField={setSortField}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                viewMode={viewMode}
                setViewMode={setViewMode}
                directionFilter={tabFilter}
                setDirectionFilter={setTabFilter}
              />

              {/* Debts List View */}
              {filteredAndSortedDebts.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredAndSortedDebts.map((debt) => (
                    <DebtCard
                      key={debt.id}
                      debt={debt}
                      currency={currency}
                      onRecordPayment={(d, mode) => openPaymentModal(d, mode || 'subtract')}
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
                    />
                  ))}
                </div>
              ) : (
                /* Empty State */
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-8 text-center shadow-2xs my-4 transition-colors">
                  <div className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-2">
                    {searchQuery ? <SearchX className="w-5 h-5" /> : <Inbox className="w-5 h-5" />}
                  </div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {searchQuery ? 'No matching entries found' : 'No records yet'}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 mb-3">
                    {searchQuery
                      ? `No financial records matched "${searchQuery}".`
                      : 'Tap "+" below to record who owes you or who you owe.'}
                  </p>
                  <button
                    onClick={() => {
                      setEditingDebt(null);
                      setIsDebtModalOpen(true);
                    }}
                    className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 font-bold rounded-xl text-xs transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600" />
                    <span>Add First Debt</span>
                  </button>
                </div>
              )}
            </>
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

      {/* Primary Detail & Advisory Overlays */}
      <PriorityAdvisorModal
        isOpen={isPriorityAdvisorOpen}
        onClose={() => setIsPriorityAdvisorOpen(false)}
        debts={debts}
        currency={currency}
        onRecordPayment={(d) => openPaymentModal(d, 'subtract')}
        onViewDetails={(d) => {
          setDetailTargetDebt(d);
          setIsDetailModalOpen(true);
        }}
      />

      <DebtDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailTargetDebt(null);
        }}
        debt={detailTargetDebt}
        currency={currency}
        onRecordPayment={(d, mode) => openPaymentModal(d, mode || 'subtract')}
        onEditDebt={(d) => {
          setEditingDebt(d);
          setIsDebtModalOpen(true);
        }}
        onDeleteDebt={(id) => {
          executeDeleteDebt(id);
        }}
        onQuickSettle={handleQuickSettle}
        onDeletePaymentRecord={handleDeletePaymentRecord}
      />

      {/* Action Overlays & Modals (Rendered with higher z-index on top of sheets) */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setEditingDebt(null);
        }}
        onSave={handleSaveDebt}
        editingDebt={editingDebt}
        currency={currency}
        existingDebts={debts}
        onRecordPayment={openPaymentModal}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setPaymentTargetDebt(null);
        }}
        debt={paymentTargetDebt}
        currency={currency}
        initialMode={paymentModalInitialMode}
        onAddPayment={handleAddPayment}
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
        onResetSampleData={() => {}}
        onClearAllData={async () => {
          if (!user) return;
          for (const d of debts) {
            await deleteDoc(doc(db, `users/${user.uid}/debts/${d.id}`));
          }
        }}
      />

      {/* Global 2nd Confirmation Modal for Deleting Debt Record */}
      <ConfirmModal
        isOpen={!!pendingDeleteDebt}
        onClose={() => setPendingDeleteDebt(null)}
        onConfirm={() => {
          if (pendingDeleteDebt) {
            executeDeleteDebt(pendingDeleteDebt.id);
            setPendingDeleteDebt(null);
          }
        }}
        title="Delete Entire Debt Record?"
        description="Are you sure you want to delete this record? This action cannot be undone and will permanently erase this record along with all recorded payments."
        confirmText="Yes, Delete Record"
        cancelText="Cancel"
        variant="danger"
        itemDetails={pendingDeleteDebt ? {
          name: pendingDeleteDebt.contact.name,
          amount: formatCurrency(pendingDeleteDebt.amount, currency),
          category: pendingDeleteDebt.category,
        } : undefined}
      />
    </div>
  );
}
