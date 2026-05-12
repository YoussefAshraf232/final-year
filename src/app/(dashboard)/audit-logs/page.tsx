'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
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
import Button from '@/components/ui/Button';
import DatePicker from '@/components/ui/DatePicker';
import { useAuth } from '@/hooks/useAuth';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import { usePagination } from '@/hooks/usePagination';
import { AuditLog } from '@/types/audit.types';
import { formatDateTime } from '@/lib/formatters';
import axios from 'axios';

const actionOptions = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'DEACTIVATE',
  'APPROVE',
  'REJECT',
  'LOGIN',
  'REGISTER',
  'VOID',
  'TRANSFER',
  'RECEIVE',
  'RESTOCK',
  'REFUND',
  'STOCK_ADJUSTMENT',
];

const entityOptions = [
  'AUTH',
  'USER',
  'ROLE',
  'PRODUCT',
  'CUSTOMER',
  'SUPPLIER',
  'WAREHOUSE',
  'SALES_INVOICE',
  'PURCHASE_INVOICE',
  'INTERNAL_INVOICE',
  'RETURN_SALES_INVOICE',
  'RETURN_PURCHASE_INVOICE',
  'STOCK_EDIT_REQUEST',
  'WAREHOUSE_STOCK_REQUEST',
  'STOCK_MOVEMENT',
];

const ACTION_VARIANT: Record<string, 'info' | 'success' | 'warning' | 'danger' | 'default'> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  DEACTIVATE: 'danger',
  APPROVE: 'success',
  REJECT: 'danger',
  LOGIN: 'default',
  REGISTER: 'info',
  VOID: 'danger',
  TRANSFER: 'info',
  RECEIVE: 'success',
  RESTOCK: 'success',
  REFUND: 'warning',
  STOCK_ADJUSTMENT: 'warning',
};

function formatMetadata(metadata: string | null): string {
  if (!metadata) return '';
  try {
    return JSON.stringify(JSON.parse(metadata), null, 2);
  } catch {
    return metadata;
  }
}

export default function AuditLogsPage() {
  const { isGuest, can } = useAuth();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState<AuditLog | null>(null);
  const { page, setPage, resetPage, paginationParams } = usePagination({
    initialSize: 20,
  });
  const canViewAudit = can('audit.view');

  const filters = {
    ...paginationParams,
    entityType: entityType || undefined,
    action: action || undefined,
    search: search || undefined,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : undefined,
    dateTo: dateTo ? new Date(dateTo + 'T23:59:59').toISOString() : undefined,
  };

  const { data, isLoading, error, refetch } = useAuditLogs(filters, {
    enabled: !isGuest && canViewAudit,
  });

  const rows: AuditLog[] = isGuest ? [] : data?.content ?? [];
  const isForbidden =
    axios.isAxiosError(error) && error.response?.status === 403;

  if (!isGuest && !canViewAudit) {
    return (
      <>
        <Topbar title="Access Denied" />
        <div className="p-6">
          <Card>
            <div className="py-8 text-center">
              <p className="text-gray-600">You do not have permission to view audit logs.</p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  const applyFilters = () => {
    setSearch(searchInput.trim());
    resetPage();
  };

  const clearFilters = () => {
    setSearch('');
    setSearchInput('');
    setEntityType('');
    setAction('');
    setDateFrom('');
    setDateTo('');
    resetPage();
  };

  const hasActiveFilters = Boolean(
    search || entityType || action || dateFrom || dateTo
  );

  const columns = [
    {
      key: 'createdAt',
      label: 'Time',
      render: (row: AuditLog) => (
        <span className="whitespace-nowrap text-sm text-gray-600">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'actorUsername',
      label: 'Actor',
      render: (row: AuditLog) => (
        <span className="font-medium text-gray-900">
          {row.actorUsername ?? 'System'}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row: AuditLog) => (
        <Badge variant={ACTION_VARIANT[row.action] ?? 'info'}>{row.action}</Badge>
      ),
    },
    {
      key: 'entityType',
      label: 'Entity',
      render: (row: AuditLog) => (
        <span className="text-gray-700">{row.entityType}</span>
      ),
    },
    {
      key: 'entityId',
      label: 'Entity ID',
      render: (row: AuditLog) => (
        <span className="text-indigo-600">{row.entityId ? `#${row.entityId}` : '—'}</span>
      ),
    },
    {
      key: 'httpMethod',
      label: 'Method',
      render: (row: AuditLog) =>
        row.httpMethod ? <Badge variant="info">{row.httpMethod}</Badge> : <span className="text-gray-400">—</span>,
    },
    {
      key: 'requestPath',
      label: 'Path',
      render: (row: AuditLog) => (
        <span className="text-xs text-gray-500">{row.requestPath ?? '—'}</span>
      ),
    },
    {
      key: 'ip',
      label: 'IP',
      render: (row: AuditLog) => <span className="text-gray-500">{row.ip ?? '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Details',
      render: (row: AuditLog) => (
        <Button type="button" variant="outline" size="sm" onClick={() => setSelected(row)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Audit Logs" subtitle="Trace sensitive operational and security events" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Audit Logs' }]} />
        {isGuest && <DemoModeBanner resource="audit logs" />}

        {!isGuest && error ? (
          <ErrorState
            title={isForbidden ? 'Access denied' : 'Could not load audit logs'}
            message={
              isForbidden
                ? 'You do not have permission to view audit logs.'
                : 'Could not load audit logs. Check that the backend is running and your session is valid.'
            }
            onRetry={isForbidden ? undefined : () => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Input
                id="audit-search"
                label="Search"
                placeholder="Search by actor, action, entity, or metadata"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') applyFilters();
                }}
              />
              <Select
                id="audit-action"
                label="Action"
                placeholder="All Actions"
                value={action}
                options={actionOptions.map((value) => ({ value, label: value.replaceAll('_', ' ') }))}
                onChange={(event) => {
                  setAction(event.target.value);
                  resetPage();
                }}
              />
              <Select
                id="audit-entity"
                label="Entity Type"
                placeholder="All Entity Types"
                value={entityType}
                options={entityOptions.map((value) => ({ value, label: value.replaceAll('_', ' ') }))}
                onChange={(event) => {
                  setEntityType(event.target.value);
                  resetPage();
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  id="audit-date-from"
                  label="Date From"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    resetPage();
                  }}
                />
                <DatePicker
                  id="audit-date-to"
                  label="Date To"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    resetPage();
                  }}
                />
              </div>
            </div>

            <div className="mb-4 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button type="button" size="sm" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>

            <Table
              columns={columns}
              data={rows}
              keyExtractor={(row) => row.id}
              isLoading={!isGuest && isLoading}
              emptyMessage={
                isGuest
                  ? 'Audit logs are not available in demo mode.'
                  : hasActiveFilters
                  ? 'No audit logs match the current filters.'
                  : 'No audit logs found.'
              }
              onRowClick={(row) => setSelected(row)}
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

      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <aside
            className="relative ml-auto h-full w-full max-w-md overflow-y-auto bg-white shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Audit Event Details"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Audit Event Details</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 transition-colors hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4 px-6 py-4 text-sm">
              <DetailRow label="Event ID" value={`#${selected.id}`} />
              <DetailRow label="Time" value={formatDateTime(selected.createdAt)} />
              <DetailRow label="Actor" value={selected.actorUsername ?? 'System'} />
              <DetailRow
                label="Actor User ID"
                value={selected.actorUserId != null ? `#${selected.actorUserId}` : '—'}
              />
              <DetailRow label="Action" value={selected.action} />
              <DetailRow label="Entity Type" value={selected.entityType} />
              <DetailRow label="Entity ID" value={selected.entityId ?? '—'} />
              <DetailRow label="HTTP Method" value={selected.httpMethod ?? '—'} />
              <DetailRow label="Request Path" value={selected.requestPath ?? '—'} />
              <DetailRow label="IP Address" value={selected.ip ?? '—'} />
              <DetailRow label="User Agent" value={selected.userAgent ?? '—'} multiline />

              {selected.metadata && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Metadata
                  </p>
                  <pre className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-3 text-xs text-green-300">
                    {formatMetadata(selected.metadata)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`col-span-2 text-gray-900 ${
          multiline ? 'break-words' : 'truncate'
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}
