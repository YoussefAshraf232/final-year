'use client';

import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { WarehouseUser } from '@/types/warehouse.types';
import { formatDate } from '@/lib/formatters';
import { ROLE_COLORS } from '@/constants/roles';
import { UserMinus } from 'lucide-react';

interface StaffTableProps {
  staff: WarehouseUser[];
  isLoading?: boolean;
  onRemove?: (userId: number) => void;
}

export default function StaffTable({ staff, isLoading, onRemove }: StaffTableProps) {
  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (item: WarehouseUser) => (
        <div>
          <p className="font-medium text-gray-900">
            {item.user?.username || `User #${item.userId}`}
          </p>
          <p className="text-xs text-gray-400">{item.user?.email || ''}</p>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (item: WarehouseUser) =>
        item.user?.role ? (
          <Badge variant={ROLE_COLORS[item.user.role] as any}>
            {item.user.role}
          </Badge>
        ) : (
          '—'
        ),
    },
    {
      key: 'assignmentDate',
      label: 'Assigned',
      render: (item: WarehouseUser) => (
        <span className="text-gray-600">{formatDate(item.assignmentDate)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (item: WarehouseUser) =>
        item.leaveDate ? (
          <Badge variant="default">Left {formatDate(item.leaveDate)}</Badge>
        ) : (
          <Badge variant="success">Active</Badge>
        ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-16',
      render: (item: WarehouseUser) =>
        !item.leaveDate && onRemove ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.userId)}
          >
            <UserMinus className="h-4 w-4 text-red-500" />
          </Button>
        ) : null,
    },
  ];

  return (
    <Table
      columns={columns}
      data={staff}
      keyExtractor={(item) => `${item.warehouseId}-${item.userId}`}
      isLoading={isLoading}
      emptyMessage="No staff assigned to this warehouse"
    />
  );
}