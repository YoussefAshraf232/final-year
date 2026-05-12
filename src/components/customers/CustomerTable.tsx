'use client';

import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Customer } from '@/types/customer.types';
import { formatCurrency } from '@/lib/formatters';
import { Edit, Eye, Trash2 } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  isLoading?: boolean;
  emptyMessage?: string;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDeactivate: (customer: Customer) => void;
}

const safeCurrency = (value?: number) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? formatCurrency(amount) : '$0.00';
};

export default function CustomerTable({
  customers,
  isLoading,
  emptyMessage,
  onView,
  onEdit,
  onDeactivate,
}: CustomerTableProps) {
  const columns = [
    {
      key: 'customerId',
      label: 'Customer ID',
      render: (c: Customer) => (
        <button
          type="button"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
          onClick={(event) => {
            event.stopPropagation();
            onView(c);
          }}
        >
          {c.customerId ?? `CUS-${String(c.id).padStart(4, '0')}`}
        </button>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (c: Customer) => <span className="font-medium text-gray-900">{c.name}</span>,
    },
    { key: 'phone', label: 'Phone', render: (c: Customer) => c.phone || '-' },
    { key: 'email', label: 'Email', render: (c: Customer) => c.email || '-' },
    { key: 'address', label: 'Address', render: (c: Customer) => c.address || '-' },
    {
      key: 'totalSales',
      label: 'Total Sales',
      render: (c: Customer) => <span className="font-medium text-gray-900">{safeCurrency(c.totalSales)}</span>,
    },
    { key: 'returnsCount', label: 'Returns', render: (c: Customer) => c.returnsCount ?? 0 },
    {
      key: 'status',
      label: 'Status',
      render: (c: Customer) => (
        <Badge variant={c.status === 'INACTIVE' ? 'warning' : 'success'}>
          {c.status === 'INACTIVE' ? 'Inactive' : 'Active'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-28',
      render: (c: Customer) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" title="View customer" onClick={(e) => { e.stopPropagation(); onView(c); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Edit customer" onClick={(e) => { e.stopPropagation(); onEdit(c); }}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Deactivate customer" onClick={(e) => { e.stopPropagation(); onDeactivate(c); }}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={customers}
      keyExtractor={(c) => c.id}
      isLoading={isLoading}
      emptyMessage={emptyMessage ?? 'No customers found'}
      onRowClick={onView}
    />
  );
}
