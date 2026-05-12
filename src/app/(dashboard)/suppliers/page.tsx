'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import ErrorState from '@/components/ui/ErrorState';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import SupplierFormFields from '@/components/suppliers/SupplierFormFields';
import SupplierDetailsDrawer from '@/components/suppliers/SupplierDetailsDrawer';
import {
  useSuppliers,
  useSupplierStats,
  useCreateSupplier,
  useUpdateSupplier,
  useDeactivateSupplier,
} from '@/hooks/useSuppliers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import { Supplier, SupplierStatus } from '@/types/supplier.types';
import { SupplierFormData } from '@/lib/validators';
import { downloadCsv } from '@/lib/exportCsv';
import { formatPhone } from '@/lib/formatters';
import {
  Users,
  CheckCircle2,
  Boxes,
  ClipboardList,
  Plus,
  Download,
  Edit,
  Eye,
  Trash2,
  RotateCcw,
} from 'lucide-react';

function errorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? fallback;
  }
  return fallback;
}

function statusBadge(status?: string) {
  if (status === 'ACTIVE') return <Badge variant="success">Active</Badge>;
  if (status === 'INACTIVE') return <Badge variant="default">Inactive</Badge>;
  return null;
}

export default function SuppliersPage() {
  const { isGuest, isSystemAdmin, isOperationalManager } = useAuth();
  const canManage = !isGuest && (isSystemAdmin || isOperationalManager);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<SupplierStatus | ''>('');
  const [hasProducts, setHasProducts] = useState<'true' | 'false' | ''>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Supplier | undefined>();
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { page, setPage, resetPage, paginationParams } = usePagination({ initialSize: 10 });

  const filters = {
    ...paginationParams,
    search: debouncedSearch || undefined,
    status: (status || undefined) as SupplierStatus | undefined,
    hasProducts: (hasProducts || undefined) as 'true' | 'false' | undefined,
  };

  const { data, isLoading, error, refetch } = useSuppliers(filters, { enabled: !isGuest });
  const { data: stats } = useSupplierStats({ enabled: !isGuest });

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deactivateSupplier = useDeactivateSupplier();

  const suppliers = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;
  const isFiltered = !!debouncedSearch || !!status || !!hasProducts;

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setHasProducts('');
    resetPage();
  };

  const toPayload = (f: SupplierFormData) => ({
    name: f.name,
    phone: f.phone || undefined,
    address: f.address || undefined,
    email: f.email || undefined,
    contactPerson: f.contactPerson || undefined,
    notes: f.notes || undefined,
    status: f.status,
  });

  const handleCreate = async (formData: SupplierFormData) => {
    try {
      await createSupplier.mutateAsync(toPayload(formData));
      setCreateOpen(false);
      toast.success('Supplier created');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create supplier'));
    }
  };

  const handleUpdate = async (formData: SupplierFormData) => {
    if (!editingSupplier) return;
    try {
      await updateSupplier.mutateAsync({
        id: editingSupplier.id,
        data: toPayload(formData),
      });
      setEditingSupplier(undefined);
      toast.success('Supplier updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update supplier'));
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateSupplier.mutateAsync(deactivateTarget.id);
      setDeactivateTarget(undefined);
      setSelectedId(null);
      toast.success('Supplier deactivated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not deactivate supplier'));
    }
  };

  const handleExport = () => {
    downloadCsv('suppliers.csv', [
      { label: 'ID', value: (s: Supplier) => s.id },
      { label: 'Name', value: (s: Supplier) => s.name },
      { label: 'Phone', value: (s: Supplier) => s.phone ?? '' },
      { label: 'Email', value: (s: Supplier) => s.email ?? '' },
      { label: 'Address', value: (s: Supplier) => s.address ?? '' },
      { label: 'Products', value: (s: Supplier) => s.productsCount ?? 0 },
      { label: 'Status', value: (s: Supplier) => s.status ?? '' },
    ], suppliers);
  };

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-20',
      render: (s: Supplier) => (
        <button
          type="button"
          className="font-mono text-xs text-indigo-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedId(s.id);
          }}
        >
          #{s.id}
        </button>
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
      key: 'phone',
      label: 'Phone',
      render: (s: Supplier) => (
        <span className="text-gray-600">{s.phone ? formatPhone(s.phone) : '—'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (s: Supplier) => <span className="text-gray-600">{s.email ?? '—'}</span>,
    },
    {
      key: 'address',
      label: 'Address',
      render: (s: Supplier) => (
        <span className="block max-w-xs truncate text-gray-600">{s.address ?? '—'}</span>
      ),
    },
    {
      key: 'productsCount',
      label: 'Products',
      render: (s: Supplier) => (
        <span className="text-gray-700">{s.productsCount ?? 0} products</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (s: Supplier) => statusBadge(s.status) ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-32',
      render: (s: Supplier) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(s.id);
            }}
            aria-label="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {canManage && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSupplier(s);
                }}
                aria-label="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeactivateTarget(s);
                }}
                aria-label="Deactivate"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Suppliers" subtitle="Manage supplier relationships" />

      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <BreadCrumb items={[{ label: 'Suppliers' }, { label: 'Manage Suppliers' }]} />
          {canManage && (
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> New Supplier
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          )}
        </div>

        {isGuest && <DemoModeBanner resource="suppliers" />}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<Users className="h-5 w-5 text-indigo-600" />}
            iconBg="bg-indigo-50"
            label="Total Suppliers"
            value={stats?.totalSuppliers ?? 0}
            sub="All suppliers in system"
          />
          <KpiCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="Active Suppliers"
            value={stats?.activeSuppliers ?? 0}
            sub="Currently active"
          />
          <KpiCard
            icon={<Boxes className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-50"
            label="Linked Products"
            value={stats?.linkedProducts ?? 0}
            sub="Across all suppliers"
          />
          <KpiCard
            icon={<ClipboardList className="h-5 w-5 text-amber-600" />}
            iconBg="bg-amber-50"
            label="Purchase Orders This Month"
            value={stats?.purchaseOrdersThisMonth ?? 0}
            sub="Total POs"
          />
        </div>

        {error && !isGuest ? (
          <ErrorState
            title="Could not load suppliers"
            message="Check that the backend is running and your session is valid."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Input
                id="search"
                label="Search"
                placeholder="Search suppliers"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
              />
              <Select
                id="statusFilter"
                label="Status"
                placeholder="All Statuses"
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as SupplierStatus | '');
                  resetPage();
                }}
              />
              <Select
                id="hasProductsFilter"
                label="Products"
                placeholder="All"
                options={[
                  { value: 'true', label: 'Has Products' },
                  { value: 'false', label: 'No Products' },
                ]}
                value={hasProducts}
                onChange={(e) => {
                  setHasProducts(e.target.value as 'true' | 'false' | '');
                  resetPage();
                }}
              />
            </div>
            {isFiltered && (
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4" /> Clear Filters
                </Button>
              </div>
            )}

            <div className="mt-4">
              <Table
                columns={columns}
                data={suppliers}
                keyExtractor={(s) => s.id}
                isLoading={isLoading}
                emptyMessage={
                  isFiltered ? 'No records match the current filters.' : 'No suppliers found.'
                }
                onRowClick={(s) => setSelectedId(s.id)}
              />

              <Pagination
                page={page}
                totalPages={totalPages}
                totalElements={totalElements}
                onPageChange={setPage}
              />
            </div>
          </Card>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        title="New Supplier"
        size="xl"
      >
        <SupplierFormFields
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          isLoading={createSupplier.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editingSupplier}
        onClose={() => setEditingSupplier(undefined)}
        title="Edit Supplier"
        size="xl"
      >
        {editingSupplier && (
          <SupplierFormFields
            initialData={editingSupplier}
            onSubmit={handleUpdate}
            onCancel={() => setEditingSupplier(undefined)}
            isLoading={updateSupplier.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(undefined)}
        onConfirm={handleDeactivate}
        title="Deactivate Supplier"
        message="Deactivate this supplier? Linked products and purchase history will be kept."
        confirmLabel="Deactivate"
        isLoading={deactivateSupplier.isPending}
      />

      <SupplierDetailsDrawer
        supplierId={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={(s) => {
          setSelectedId(null);
          setEditingSupplier(s);
        }}
        onDeactivate={(s) => setDeactivateTarget(s)}
        canManage={canManage}
      />
    </>
  );
}

interface KpiCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  sub: string;
}

function KpiCard({ icon, iconBg, label, value, sub }: KpiCardProps) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
    </Card>
  );
}
