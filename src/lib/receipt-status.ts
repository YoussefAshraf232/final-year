import type { BadgeVariant } from '@/components/ui/Badge';
import type { ReceiptStatus } from '@/types/purchase-invoice.types';

export function receiptStatusLabel(status?: ReceiptStatus | null): string {
  switch (status) {
    case 'PENDING_RECEIPT': return 'Pending Receipt';
    case 'PARTIALLY_RECEIVED': return 'Partially Received';
    case 'RECEIVED': return 'Received';
    case 'DAMAGED_ITEMS': return 'Damaged Items';
    case 'REJECTED': return 'Rejected';
    default: return 'Pending Receipt';
  }
}

export function receiptStatusBadge(status?: ReceiptStatus | null): { variant: BadgeVariant } {
  switch (status) {
    case 'RECEIVED': return { variant: 'success' };
    case 'PARTIALLY_RECEIVED': return { variant: 'warning' };
    case 'DAMAGED_ITEMS': return { variant: 'danger' };
    case 'REJECTED': return { variant: 'default' };
    case 'PENDING_RECEIPT':
    default: return { variant: 'info' };
  }
}

export const RECEIPT_STATUS_OPTIONS: { value: ReceiptStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING_RECEIPT', label: 'Pending Receipt' },
  { value: 'PARTIALLY_RECEIVED', label: 'Partially Received' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'DAMAGED_ITEMS', label: 'Damaged Items' },
  { value: 'REJECTED', label: 'Rejected' },
];
