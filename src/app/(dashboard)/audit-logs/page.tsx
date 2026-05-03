'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { usePagination } from '@/hooks/usePagination';
import { AuditEntityType, AuditLog } from '@/types/audit.types';
import { formatDateTime } from '@/lib/formatters';

const entityTypes: AuditEntityType[] = [
  'AUTH',
  'PRODUCT',
  'CUSTOMER',
  'SUPPLIER',
  'WAREHOUSE',
  'SALES_INVOICE',
  'PURCHASE_INVOICE',
  'PAYMENT',
  'STOCK_ADJUSTMENT',
  'STOCK_TRANSFER',
  'USER',
  'ROLE',
];

const demoLogs: AuditLog[] = [
  {
    id: 1,
    actorUserId: 1,
    actorUsername: 'admin',
    action: 'CREATE_PRODUCT',
    entityType: 'PRODUCT',
    entityId: 1,
    createdAt: '2026-04-22T09:30:00Z',
  },
  {
    id: 2,
    actorUserId: 1,
    actorUsername: 'admin',
    action: 'ROLE_CHANGE',
    entityType: 'ROLE',
    entityId: 2,
    createdAt: '2026-04-23T14:20:00Z',
  },
];

export default function AuditLogsPage() {
  const { isGuest, can } = useAuth();
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const { page, setPage, resetPage, paginationParams } = usePagination({
    initialSize: 20,
  });
  const canViewAudit = can('audit.view');

  const { data, isLoading, error, refetch } = useAuditLogs(
    {
      ...paginationParams,
      entityType: entityType ? (entityType as AuditEntityType) : undefined,
      action: action || undefined,
    },
    { enabled: !isGuest && canViewAudit }
  );

  const rows = isGuest ? demoLogs : data?.content ?? [];

  if (!isGuest && !canViewAudit) {
    return (
      <>
        <Topbar title="Access Denied" />
        <div className="p-6">
          <Card>
            <div className="py-8 text-center">
              <p className="text-gray-600">You do not have permission to view audit logs.</p>
              <p className="mt-2 text-sm text-gray-400">Audit logs require the audit.view permission.</p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  const columns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row: AuditLog) => (
        <span className="text-sm text-gray-600">{formatDateTime(row.createdAt)}</span>
      ),
    },
    {
      key: 'actorUsername',
      label: 'Actor',
      render: (row: AuditLog) => (
        <span className="font-medium text-gray-900">{row.actorUsername}</span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row: AuditLog) => <Badge variant="info">{row.action}</Badge>,
    },
    {
      key: 'entityType',
      label: 'Entity',
      render: (row: AuditLog) => (
        <span className="text-gray-600">
          {row.entityType} #{row.entityId}
        </span>
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP',
      render: (row: AuditLog) => <span className="text-gray-500">{row.ipAddress || 'N/A'}</span>,
    },
  ];

  return (
    <>
      <Topbar title="Audit Logs" subtitle="Trace sensitive operational and security events" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Audit Logs' }]} />
        {isGuest && <DemoModeBanner resource="audit logs" />}

        {error && !isGuest ? (
          <ErrorState
            title="Could not load audit logs"
            message="Audit logging requires GET /audit-logs. No demo logs are shown to authenticated users."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <Select
                id="audit-entity"
                label="Entity"
                placeholder="All entities"
                value={entityType}
                options={entityTypes.map((type) => ({ value: type, label: type.replaceAll('_', ' ') }))}
                onChange={(event) => {
                  setEntityType(event.target.value);
                  resetPage();
                }}
              />
              <Input
                id="audit-action"
                label="Action"
                placeholder="CREATE_PRODUCT"
                value={action}
                onChange={(event) => {
                  setAction(event.target.value);
                  resetPage();
                }}
              />
            </div>

            <Table
              columns={columns}
              data={rows}
              keyExtractor={(row) => row.id}
              isLoading={!isGuest && isLoading}
              emptyMessage="No audit logs found"
            />

            {!isGuest && data && (
              <Pagination
                page={page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                isFirst={data.first}
                isLast={data.last}
                onPageChange={setPage}
              />
            )}
          </Card>
        )}
      </div>
    </>
  );
}
