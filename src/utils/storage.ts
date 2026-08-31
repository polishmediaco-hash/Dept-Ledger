import { DebtItem } from '../types';

export function exportToJSON(debts: DebtItem[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(debts, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `debts_and_loans_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportToCSV(debts: DebtItem[]): void {
  const headers = [
    'ID',
    'Title',
    'Direction',
    'Category',
    'Contact Name',
    'Company',
    'Email',
    'Phone',
    'Payment Handle / Bank Details',
    'Original Amount',
    'Paid Amount',
    'Remaining Balance',
    'Currency',
    'Start Date (Originated)',
    'Due Date (Deadline)',
    'Priority',
    'Priority Reason',
    'Notes'
  ];

  const rows = debts.map((d) => [
    `"${d.id}"`,
    `"${(d.title || '').replace(/"/g, '""')}"`,
    `"${d.direction === 'owed_to_me' ? 'Owed to Me' : 'I Owe'}"`,
    `"${d.category}"`,
    `"${(d.contact.name || '').replace(/"/g, '""')}"`,
    `"${(d.contact.company || '').replace(/"/g, '""')}"`,
    `"${(d.contact.email || '').replace(/"/g, '""')}"`,
    `"${(d.contact.phone || '').replace(/"/g, '""')}"`,
    `"${(d.contact.paymentDetails || '').replace(/"/g, '""')}"`,
    d.amount.toFixed(2),
    d.paidAmount.toFixed(2),
    (d.amount - d.paidAmount).toFixed(2),
    `"${d.currency}"`,
    `"${d.startDate}"`,
    `"${d.dueDate}"`,
    `"${d.priority}"`,
    `"${(d.priorityReason || '').replace(/"/g, '""')}"`,
    `"${(d.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodeURI(csvContent));
  downloadAnchor.setAttribute('download', `financial_debts_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
