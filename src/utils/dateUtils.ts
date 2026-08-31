import { DebtItem, DebtStatus, PriorityLevel } from '../types';

/**
 * Calculates days between two date strings (YYYY-MM-DD)
 */
export function getDaysDifference(fromDateStr: string, toDateStr: string): number {
  if (!fromDateStr || !toDateStr) return 0;
  const from = new Date(fromDateStr + 'T00:00:00');
  const to = new Date(toDateStr + 'T00:00:00');
  const diffTime = to.getTime() - from.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get current date formatted as YYYY-MM-DD in local time
 */
export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Computes how many days the debt has existed (from startDate to today)
 */
export function getDaysElapsed(startDateStr: string): number {
  if (!startDateStr) return 0;
  const today = getTodayString();
  const days = getDaysDifference(startDateStr, today);
  return Math.max(0, days);
}

/**
 * Format duration elapsed into human-readable string (e.g., "45 days", "3 months, 2 days")
 */
export function formatDurationElapsed(startDateStr: string): string {
  const days = getDaysElapsed(startDateStr);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  if (months === 1) {
    return remainingDays > 0 ? `1 mo, ${remainingDays} d` : '1 month';
  }
  return remainingDays > 0 ? `${months} mos, ${remainingDays} d` : `${months} months`;
}

/**
 * Computes days remaining until due date (positive = remaining, negative = overdue)
 */
export function getDaysUntilDue(dueDateStr: string): number {
  if (!dueDateStr) return 0;
  const today = getTodayString();
  return getDaysDifference(today, dueDateStr);
}

/**
 * Format deadline status with human friendly label & urgency level
 */
export function formatDeadlineStatus(dueDateStr: string, isSettled: boolean): {
  label: string;
  isOverdue: boolean;
  daysDiff: number;
  urgencyClass: string;
} {
  if (isSettled) {
    return {
      label: 'Settled',
      isOverdue: false,
      daysDiff: 0,
      urgencyClass: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    };
  }

  if (!dueDateStr) {
    return {
      label: 'No deadline',
      isOverdue: false,
      daysDiff: 0,
      urgencyClass: 'text-zinc-600 bg-zinc-50 border-zinc-200'
    };
  }

  const daysDiff = getDaysUntilDue(dueDateStr);

  if (daysDiff < 0) {
    const overdueDays = Math.abs(daysDiff);
    return {
      label: overdueDays === 1 ? '1 day overdue' : `${overdueDays} days overdue`,
      isOverdue: true,
      daysDiff,
      urgencyClass: 'text-rose-700 bg-rose-50 border-rose-200 font-semibold'
    };
  } else if (daysDiff === 0) {
    return {
      label: 'Due today!',
      isOverdue: false,
      daysDiff: 0,
      urgencyClass: 'text-amber-700 bg-amber-50 border-amber-300 font-semibold animate-pulse'
    };
  } else if (daysDiff === 1) {
    return {
      label: 'Due tomorrow',
      isOverdue: false,
      daysDiff: 1,
      urgencyClass: 'text-amber-700 bg-amber-50 border-amber-200'
    };
  } else if (daysDiff <= 7) {
    return {
      label: `Due in ${daysDiff} days`,
      isOverdue: false,
      daysDiff,
      urgencyClass: 'text-amber-600 bg-amber-50/70 border-amber-200'
    };
  } else {
    return {
      label: `Due in ${daysDiff} days`,
      isOverdue: false,
      daysDiff,
      urgencyClass: 'text-zinc-700 bg-zinc-50 border-zinc-200'
    };
  }
}

/**
 * Determines current dynamic status of a debt item
 */
export function getDebtStatus(debt: DebtItem): DebtStatus {
  const balance = debt.amount - debt.paidAmount;
  if (balance <= 0.001) {
    return 'settled';
  }
  
  const daysUntil = getDaysUntilDue(debt.dueDate);
  if (daysUntil < 0) {
    return 'overdue';
  }
  
  if (debt.paidAmount > 0) {
    return 'partially_paid';
  }

  return 'active';
}

/**
 * Format date nicely for display (e.g. "Aug 18, 2026")
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Priority sorting score (higher = higher priority to pay)
 */
export function getPriorityScore(debt: DebtItem): number {
  const balance = debt.amount - debt.paidAmount;
  if (balance <= 0) return -1000; // Settled is lowest priority

  let score = 0;

  // Base priority score
  switch (debt.priority) {
    case 'urgent':
      score += 400;
      break;
    case 'high':
      score += 300;
      break;
    case 'medium':
      score += 200;
      break;
    case 'low':
      score += 100;
      break;
  }

  // Days until due influence (closer or overdue = higher score)
  const daysUntil = getDaysUntilDue(debt.dueDate);
  if (daysUntil < 0) {
    // Overdue! Score increases with days overdue
    score += Math.min(300, 150 + Math.abs(daysUntil) * 5);
  } else if (daysUntil <= 3) {
    score += 120;
  } else if (daysUntil <= 7) {
    score += 80;
  } else if (daysUntil <= 14) {
    score += 40;
  }

  // Duration owed influence (longer pending also adds slight urgency)
  const elapsed = getDaysElapsed(debt.startDate);
  score += Math.min(50, elapsed);

  return score;
}

export function formatCurrency(amount: number, currency: string = 'DZD'): string {
  const formattedNum = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  if (!currency || currency === 'DZD') {
    return `${formattedNum} DZD`;
  }

  // Standard symbols prefix directly
  if (currency === '$' || currency === '€' || currency === '£' || currency === '¥' || currency === '₹') {
    return `${currency}${formattedNum}`;
  }

  // Multi-character currency codes as suffix
  return `${formattedNum} ${currency}`;
}
