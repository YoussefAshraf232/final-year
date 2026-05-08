'use client';

import { useRouter } from 'next/navigation';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import { Supplier } from '@/types/supplier.types';
import { ROUTES } from '@/constants/routes';
import { formatPhone } from '@/lib/formatters';
import { Edit, Trash2, Eye } from 'lucide-react';

interface SupplierTableProps {
  suppliers: Supplier[];
  isLoading?: boolean;
  onDelete?: (supplier: Supplier) => void;
}

export default function SupplierTable({ suppliers, isLoading, onDelete }: SupplierTableProps) {
  const router = useRouter();

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      render: (s: Supplier) => (
        <span className="text-gray-400 font-mono text-xs">#{s.id}</span>
      ),
    },
    {
      key: 'name',
      label: 'Name',
      render: (s: Supplier) => (
        <span className="font-medium text-gray-900">{s.name}</span>
      ),
    },
    {
      key: 'phoneNumber',
      label: 'Phone',
      render: (s: Supplier) => (
        <span className="text-gray-600">{formatPhone(s.phoneNumber)}</span>
      ),
    },
    {
      key: 'address',
      label: 'Address',
      render: (s: Supplier) => (
        <span className="text-gray-600 truncate max-w-xs block">{s.address}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-24',
      render: (s: Supplier) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost" size="sm"
            onClick={(e) => { e.stopPropagation(); router.push(ROUTES.SUPPLIER_DETAIL(s.id)); }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={(e) => { e.stopPropagation(); router.push(ROUTES.SUPPLIER_EDIT(s.id)); }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete?.(s); }}
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
      data={suppliers}
      keyExtractor={(s) => s.id}
      isLoading={isLoading}
      emptyMessage="No suppliers found"
      onRowClick={(s) => router.push(ROUTES.SUPPLIER_DETAIL(s.id))}
    />
  );
}