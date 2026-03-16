'use client';

import { useRouter } from 'next/navigation';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Customer } from '@/types/customer.types';
import { ROUTES } from '@/constants/routes';
import { Edit, Trash2, Eye } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  isLoading?: boolean;
  onDelete?: (customer: Customer) => void;
}

export default function CustomerTable({ customers, isLoading, onDelete }: CustomerTableProps) {
  const router = useRouter();

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      render: (c: Customer) => (
        <span className="text-gray-400 font-mono text-xs">#{c.id}</span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (c: Customer) => (
        <span className="font-medium text-gray-900">{c.name}</span>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (c: Customer) => (
        <span className="text-gray-600">{c.address}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-24',
      render: (c: Customer) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); router.push(ROUTES.CUSTOMER_DETAIL(c.id)); }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); router.push(ROUTES.CUSTOMER_EDIT(c.id)); }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete?.(c); }}
          >
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
      emptyMessage="No customers found"
      onRowClick={(c) => router.push(ROUTES.CUSTOMER_DETAIL(c.id))}
    />
  );
}