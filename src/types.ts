export type DebtDirection = 'owed_to_me' | 'i_owe'; // 'owed_to_me' = Lent/Receivable, 'i_owe' = Borrowed/Payable
export type DebtCategory = 'personal' | 'business';
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';
export type DebtStatus = 'active' | 'partially_paid' | 'settled' | 'overdue';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod?: string; // e.g. Zelle, Cash, Bank Transfer, PayPal, Venmo, Check
  createdAt: string;
}

export interface ContactInfo {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  relationship?: string; // e.g., Friend, Client, Landlord, Supplier, Contractor, Sibling
  paymentDetails?: string; // e.g., Venmo: @john, IBAN / Account #, Zelle: 555-0199
}

export interface DebtItem {
  id: string;
  title: string; // e.g. "Web Design Project Invoice", "Loan for Car Repair", "Dinner Split"
  direction: DebtDirection;
  category: DebtCategory;
  amount: number;
  paidAmount: number;
  currency: string;
  startDate: string; // YYYY-MM-DD (when debt originated)
  dueDate: string; // YYYY-MM-DD (deadline)
  priority: PriorityLevel;
  priorityReason?: string; // e.g. "Late fee after 5 days", "Close friend", "Important client"
  contact: ContactInfo;
  notes?: string;
  tags?: string[];
  payments: PaymentRecord[];
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'cards' | 'table';
export type TabFilter = 'all' | 'owed_to_me' | 'i_owe';
export type CategoryFilter = 'all' | 'personal' | 'business';
export type PriorityFilter = 'all' | PriorityLevel;
export type StatusFilter = 'all' | 'active' | 'partially_paid' | 'settled' | 'overdue';
export type SortField = 'priority' | 'dueDate' | 'startDate' | 'balance' | 'name' | 'duration';
export type SortOrder = 'asc' | 'desc';
