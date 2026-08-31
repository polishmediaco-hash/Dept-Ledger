import { DebtItem } from '../types';
import { getTodayString } from './dateUtils';

// Helper to compute relative date string (e.g. daysAgo(-10) or daysFromNow(+5))
function offsetDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_SAMPLE_DEBTS: DebtItem[] = [
  {
    id: 'debt-1',
    ownerId: 'sample-user',
    title: 'Brand Identity & Web Redesign Invoice #204',
    direction: 'owed_to_me',
    category: 'business',
    amount: 45000.00,
    paidAmount: 15000.00,
    currency: 'DZD',
    startDate: offsetDays(-42), // 42 days ago
    dueDate: offsetDays(-12),   // Overdue by 12 days!
    priority: 'urgent',
    priorityReason: 'Invoice net-30 terms expired, client agreed to follow-up call this week.',
    contact: {
      name: 'Marcus Vance',
      company: 'Apex Media Studio',
      email: 'm.vance@apexmediastudio.com',
      phone: '+213 550 23 48 90',
      relationship: 'Client',
      paymentDetails: 'CCP / RIP: 00799999002134567890 / BaridiMob'
    },
    notes: 'Completed full Figma prototype & frontend delivery. Initial milestone deposit was paid on Day 1.',
    tags: ['Invoice', 'Design', 'Milestone 2'],
    payments: [
      {
        id: 'pay-101',
        amount: 15000.00,
        date: offsetDays(-40),
        note: 'Initial kickoff deposit via BaridiMob',
        paymentMethod: 'BaridiMob',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'debt-2',
    ownerId: 'sample-user',
    title: 'MacBook Pro Hardware Loan (Studio Upgrade)',
    direction: 'i_owe',
    category: 'business',
    amount: 28500.00,
    paidAmount: 8500.00,
    currency: 'DZD',
    startDate: offsetDays(-28), // 28 days ago
    dueDate: offsetDays(3),     // Due in 3 days!
    priority: 'urgent',
    priorityReason: 'Zero-interest agreement if paid before 30 days deadline; critical business relationship.',
    contact: {
      name: 'Elena Rostova',
      company: 'TechCraft Solutions',
      email: 'elena@techcraft.dev',
      phone: '+213 661 78 90 12',
      relationship: 'Supplier / Partner',
      paymentDetails: 'BaridiMob / Bank Wire: BNA 002000...'
    },
    notes: 'Purchased hardware for video rendering pipeline. Need to pay remaining 20,000 DZD.',
    tags: ['Equipment', 'Hardware', 'High Urgency'],
    payments: [
      {
        id: 'pay-102',
        amount: 8500.00,
        date: offsetDays(-14),
        note: 'First installment via BaridiMob',
        paymentMethod: 'BaridiMob',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'debt-3',
    ownerId: 'sample-user',
    title: 'Weekend Trip AirBnB & Grocery Split',
    direction: 'owed_to_me',
    category: 'personal',
    amount: 7500.00,
    paidAmount: 0.00,
    currency: 'DZD',
    startDate: offsetDays(-18),
    dueDate: offsetDays(5),
    priority: 'medium',
    priorityReason: 'Friendly reminder needed before end of month paycheck.',
    contact: {
      name: 'David Chen',
      email: 'dchen.personal@gmail.com',
      phone: '+213 770 91 23 45',
      relationship: 'Close Friend',
      paymentDetails: 'BaridiMob / Cash'
    },
    notes: 'Paid for cabin booking & Saturday dinner for the whole group. David owes for 2 persons.',
    tags: ['Travel', 'Shared Expenses', 'Friends'],
    payments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'debt-4',
    ownerId: 'sample-user',
    title: 'Freelance Mobile App QA & Beta Testing',
    direction: 'i_owe',
    category: 'business',
    amount: 16000.00,
    paidAmount: 0.00,
    currency: 'DZD',
    startDate: offsetDays(-15),
    dueDate: offsetDays(10),
    priority: 'high',
    priorityReason: 'Subcontractor completed deliverable; release payment on client signoff.',
    contact: {
      name: 'Sofia Martinez',
      company: 'AppPulse QA',
      email: 'sofia.qa@apppulse.io',
      phone: '+213 555 43 17 78',
      relationship: 'Contractor',
      paymentDetails: 'BaridiMob / CCP Direct'
    },
    notes: 'Tested iOS build v1.4 across 8 device form-factors. Found and verified 14 bug resolutions.',
    tags: ['Subcontractor', 'Mobile App', 'Development'],
    payments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'debt-5',
    ownerId: 'sample-user',
    title: 'Emergency Car Transmission Repair Loan',
    direction: 'i_owe',
    category: 'personal',
    amount: 24000.00,
    paidAmount: 12000.00,
    currency: 'DZD',
    startDate: offsetDays(-65), // 65 days ago
    dueDate: offsetDays(20),
    priority: 'high',
    priorityReason: 'Promised to repay in two 12,000 DZD installments by end of next month.',
    contact: {
      name: 'Uncle Robert Miller',
      email: 'rmiller1965@yahoo.com',
      phone: '+213 540 34 56 78',
      relationship: 'Family (Uncle)',
      paymentDetails: 'Cash / BaridiMob'
    },
    notes: 'Helped cover unexpected mechanic bill when transmission failed.',
    tags: ['Family', 'Car Repair', 'Personal Loan'],
    payments: [
      {
        id: 'pay-103',
        amount: 12000.00,
        date: offsetDays(-30),
        note: 'First 12,000 DZD installment sent',
        paymentMethod: 'BaridiMob',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'debt-6',
    ownerId: 'sample-user',
    title: 'Concert Tickets & VIP Passes (2x)',
    direction: 'owed_to_me',
    category: 'personal',
    amount: 5800.00,
    paidAmount: 5800.00,
    currency: 'DZD',
    startDate: offsetDays(-50),
    dueDate: offsetDays(-20),
    priority: 'low',
    priorityReason: 'Settled in full.',
    contact: {
      name: 'Sarah Jenkins',
      email: 'sarah.j@outlook.com',
      phone: '+213 660 67 81 23',
      relationship: 'Friend / Colleague',
      paymentDetails: 'BaridiMob / Cash'
    },
    notes: 'Bought festival weekend passes during pre-sale.',
    tags: ['Events', 'Settled'],
    payments: [
      {
        id: 'pay-104',
        amount: 5800.00,
        date: offsetDays(-21),
        note: 'Paid in full via BaridiMob with thanks!',
        paymentMethod: 'BaridiMob',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
