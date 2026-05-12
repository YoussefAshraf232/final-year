'use client';

import { useState, useMemo } from 'react';
import {
  Building2,
  Store,
  Warehouse as WarehouseIcon,
  Users as UsersIcon,
  Eye,
  Edit,
  Trash2,
  Plus,
  X,
  Phone,
  MapPin,
  Calendar,
  Package,
  AlertTriangle,
} from 'lucide-react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import {
  useWarehouses,
  useWarehouseSummary,
  useCreateWarehouse,
  useUpdateWarehouse,
  useDeactivateWarehouse,
} from '@/hooks/useWarehouses';
import { useUsers } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  Warehouse,
  CreateWarehouseRequest,
  WarehouseStatus,
} from '@/types/warehouse.types';
import { formatDate } from '@/lib/formatters';

const fallbackWarehouses: Warehouse[] = [
  {
    id: 1,
    address: 'Cairo Central Warehouse',
    isCentral: true,
    status: 'ACTIVE',
    phone: '+20 100 555 0101',
    productsCount: 128,
    totalStock: 4850,
    lowStockItems: 7,
    createdAt: '2026-05-10T00:00:00Z',
    manager: { id: 1, username: 'omar', firstName: 'Omar', lastName: 'Hassan' },
  },
];

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  tone: string;
}

function KpiCard({ title, value, icon, tone }: KpiCardProps) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tone}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-medium text-gray-500">{title}</div>
          <div className="text-2xl font-bold text-gray-900 mt-0.5">{value}</div>
        </div>
      </div>
    </Card>
  );
}

interface WarehouseFormState {
  address: string;
  isCentral: boolean;
  status: WarehouseStatus;
  phone: string;
  notes: string;
  managerUserId: string;
}

const emptyForm: WarehouseFormState = {
  address: '',
  isCentral: false,
  status: 'ACTIVE',
  phone: '',
  notes: '',
  managerUserId: '',
};

export default function WarehousesPage() {
  const { isGuest } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [managerFilter, setManagerFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const [selected, setSelected] = useState<Warehouse | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Warehouse | null>(null);

  const [form, setForm] = useState<WarehouseFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const enabled = !isGuest;
  const { data, isLoading, error, refetch } = useWarehouses(
    { page: 0, size: 100 },
    { enabled }
  );
  const { data: summary } = useWarehouseSummary({ enabled });
  const { data: usersData } = useUsers({ page: 0, size: 200 }, { enabled });

  const createMutation = useCreateWarehouse();
  const updateMutation = useUpdateWarehouse();
  const deactivateMutation = useDeactivateWarehouse();

  const showDemoData = isGuest;
  const showError = !showDemoData && !!error;
  const backendWarehouses = data?.content ?? [];
  const baseWarehouses = showDemoData ? fallbackWarehouses : backendWarehouses;

  const managers = useMemo(() => {
    const users = usersData?.content ?? [];
    return users.filter((u) =>
      (u.role || u.roleName) === 'WAREHOUSE_MANAGER' ||
      (u.role || u.roleName) === 'OPERATIONAL_MANAGER' ||
      (u.role || u.roleName) === 'SYSTEM_ADMIN'
    );
  }, [usersData]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    return baseWarehouses.filter((w) => {
      if (q && !w.address.toLowerCase().includes(q)) return false;
      if (typeFilter === 'CENTRAL' && !w.isCentral) return false;
      if (typeFilter === 'BRANCH' && w.isCentral) return false;
      if (statusFilter && (w.status ?? 'ACTIVE') !== statusFilter) return false;
      if (managerFilter && String(w.manager?.id ?? '') !== managerFilter) return false;
      return true;
    });
  }, [baseWarehouses, debouncedSearch, typeFilter, statusFilter, managerFilter]);

  function openCreate() {
    setForm(emptyForm);
    setFormError(null);
    setCreateOpen(true);
  }

  function openEdit(w: Warehouse) {
    setEditing(w);
    setForm({
      address: w.address,
      isCentral: !!w.isCentral,
      status: (w.status as WarehouseStatus) || 'ACTIVE',
      phone: w.phone ?? '',
      notes: w.notes ?? '',
      managerUserId: w.manager ? String(w.manager.id) : '',
    });
    setFormError(null);
    setEditOpen(true);
  }

  function buildPayload(): CreateWarehouseRequest {
    return {
      address: form.address.trim(),
      isCentral: form.isCentral,
      status: form.status,
      phone: form.phone.trim() || null,
      notes: form.notes.trim() || null,
      managerUserId: form.managerUserId ? Number(form.managerUserId) : null,
    };
  }

  async function handleCreate() {
    if (!form.address.trim()) {
      setFormError('Address required');
      return;
    }
    try {
      await createMutation.mutateAsync(buildPayload());
      setCreateOpen(false);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setFormError(err?.response?.data?.message || err?.message || 'Failed to create');
    }
  }

  async function handleUpdate() {
    if (!editing || !form.address.trim()) {
      setFormError('Address required');
      return;
    }
    try {
      await updateMutation.mutateAsync({ id: editing.id, data: buildPayload() });
      setEditOpen(false);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setFormError(err?.response?.data?.message || err?.message || 'Failed to update');
    }
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    try {
      await deactivateMutation.mutateAsync(deactivateTarget.id);
      setDeactivateOpen(false);
      setDeactivateTarget(null);
      if (selected?.id === deactivateTarget.id) setSelected(null);
    } catch (e) {
      console.error(e);
    }
  }

  const totalWarehouses = summary?.totalWarehouses ?? baseWarehouses.length;
  const centralCount = summary?.centralWarehouses ?? baseWarehouses.filter((w) => w.isCentral).length;
  const branchCount = summary?.branchWarehouses ?? baseWarehouses.filter((w) => !w.isCentral).length;
  const activeManagers = summary?.activeManagers ?? baseWarehouses.filter((w) => w.manager).length;

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-16',
      render: (w: Warehouse) => (
        <button
          onClick={() => setSelected(w)}
          className="text-gray-500 font-mono text-xs hover:text-indigo-600"
        >
          #{w.id}
        </button>
      ),
    },
    {
      key: 'address',
      label: 'Warehouse',
      render: (w: Warehouse) => (
        <button onClick={() => setSelected(w)} className="text-left">
          <span className="font-medium text-gray-900 hover:text-indigo-600">{w.address}</span>
        </button>
      ),
    },
    {
      key: 'isCentral',
      label: 'Type',
      render: (w: Warehouse) => (
        <Badge variant={w.isCentral ? 'success' : 'info'}>
          {w.isCentral ? 'Central' : 'Branch'}
        </Badge>
      ),
    },
    {
      key: 'manager',
      label: 'Manager',
      render: (w: Warehouse) => (
        <span className="text-gray-700 text-sm">
          {w.manager
            ? `${w.manager.firstName ?? ''} ${w.manager.lastName ?? ''}`.trim() || w.manager.username
            : '—'}
        </span>
      ),
    },
    {
      key: 'productsCount',
      label: 'Products',
      render: (w: Warehouse) => <span className="text-gray-700">{w.productsCount ?? 0}</span>,
    },
    {
      key: 'totalStock',
      label: 'Total Stock',
      render: (w: Warehouse) => (
        <span className="text-gray-700">{(w.totalStock ?? 0).toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (w: Warehouse) => (
        <Badge variant={(w.status ?? 'ACTIVE') === 'ACTIVE' ? 'success' : 'default'}>
          {(w.status ?? 'ACTIVE') === 'ACTIVE' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (w: Warehouse) => (
        <span className="text-gray-600 text-sm">{formatDate(w.createdAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-32',
      render: (w: Warehouse) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setSelected(w)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(w)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDeactivateTarget(w);
              setDeactivateOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar
        title="Warehouses"
        subtitle="Manage warehouse locations, managers, stock visibility, and branch structure"
      />

      <div className="p-6 flex gap-6">
        <div className="flex-1 min-w-0">
          <BreadCrumb items={[{ label: 'Warehouses' }]} />

          {showDemoData && <DemoModeBanner resource="warehouses" />}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              title="Total Warehouses"
              value={totalWarehouses}
              icon={<Building2 className="h-6 w-6 text-indigo-600" />}
              tone="bg-indigo-50"
            />
            <KpiCard
              title="Central Warehouses"
              value={centralCount}
              icon={<WarehouseIcon className="h-6 w-6 text-emerald-600" />}
              tone="bg-emerald-50"
            />
            <KpiCard
              title="Branch Warehouses"
              value={branchCount}
              icon={<Store className="h-6 w-6 text-blue-600" />}
              tone="bg-blue-50"
            />
            <KpiCard
              title="Active Managers"
              value={activeManagers}
              icon={<UsersIcon className="h-6 w-6 text-violet-600" />}
              tone="bg-violet-50"
            />
          </div>

          {showError ? (
            <ErrorState
              title="Could not load warehouses"
              message="Check that the backend is running and your session is valid."
              onRetry={() => void refetch()}
            />
          ) : (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Warehouses</h2>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  New Warehouse
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <Input
                  id="wh-search"
                  placeholder="Search warehouses"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Select
                  id="wh-type"
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'CENTRAL', label: 'Central' },
                    { value: 'BRANCH', label: 'Branch' },
                  ]}
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                />
                <Select
                  id="wh-manager"
                  options={[
                    { value: '', label: 'All Managers' },
                    ...managers.map((m) => ({
                      value: String(m.id),
                      label: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.username,
                    })),
                  ]}
                  value={managerFilter}
                  onChange={(e) => setManagerFilter(e.target.value)}
                />
                <Select
                  id="wh-status"
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'INACTIVE', label: 'Inactive' },
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>

              <Table
                columns={columns}
                data={filtered}
                keyExtractor={(w) => w.id}
                isLoading={!showDemoData && isLoading}
                emptyMessage={
                  debouncedSearch || typeFilter || managerFilter || statusFilter
                    ? 'No records match the current filters.'
                    : 'No warehouses found.'
                }
              />
            </Card>
          )}
        </div>

        {selected && (
          <aside className="w-96 bg-white border border-gray-200/80 rounded-xl shadow-sm flex flex-col self-start sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Warehouse Details</h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <WarehouseIcon className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{selected.address}</div>
                  <Badge variant={(selected.status ?? 'ACTIVE') === 'ACTIVE' ? 'success' : 'default'}>
                    {(selected.status ?? 'ACTIVE') === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <DetailRow label="Warehouse ID" value={`WH-${String(selected.id).padStart(3, '0')}`} />
                <DetailRow
                  label="Type"
                  value={
                    <Badge variant={selected.isCentral ? 'success' : 'info'}>
                      {selected.isCentral ? 'Central' : 'Branch'}
                    </Badge>
                  }
                />
                <DetailRow
                  label="Manager"
                  value={
                    selected.manager
                      ? `${selected.manager.firstName ?? ''} ${selected.manager.lastName ?? ''}`.trim() ||
                        selected.manager.username
                      : '—'
                  }
                />
                <DetailRow
                  label="Phone"
                  value={selected.phone ?? '—'}
                  icon={<Phone className="h-3.5 w-3.5" />}
                />
                <DetailRow label="Address" value={selected.address} icon={<MapPin className="h-3.5 w-3.5" />} />
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <DetailRow
                  label="Total products"
                  value={selected.productsCount ?? 0}
                  icon={<Package className="h-3.5 w-3.5" />}
                />
                <DetailRow
                  label="Total stock"
                  value={`${(selected.totalStock ?? 0).toLocaleString()} units`}
                />
                <DetailRow
                  label="Low stock items"
                  value={selected.lowStockItems ?? 0}
                  icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                />
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <DetailRow
                  label="Created"
                  value={formatDate(selected.createdAt)}
                  icon={<Calendar className="h-3.5 w-3.5" />}
                />
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => router.push(`/stock?warehouseId=${selected.id}`)}
                >
                  View Stock
                </Button>
                <Button variant="outline" fullWidth onClick={() => openEdit(selected)}>
                  Edit Warehouse
                </Button>
                {(selected.status ?? 'ACTIVE') === 'ACTIVE' && (
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => {
                      setDeactivateTarget(selected);
                      setDeactivateOpen(true);
                    }}
                  >
                    Deactivate
                  </Button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Warehouse"
        size="lg"
      >
        <WarehouseForm
          form={form}
          onChange={setForm}
          managers={managers}
          formError={formError}
        />
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} isLoading={createMutation.isPending}>
            Create
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Warehouse"
        size="lg"
      >
        <WarehouseForm
          form={form}
          onChange={setForm}
          managers={managers}
          formError={formError}
        />
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setEditOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} isLoading={updateMutation.isPending}>
            Save
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Warehouse"
        message="Deactivate this warehouse? Stock history, transfers, and reports will be kept."
        confirmLabel="Deactivate"
        isLoading={deactivateMutation.isPending}
      />
    </>
  );
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-gray-900 font-medium text-right">{value}</div>
    </div>
  );
}

interface WarehouseFormProps {
  form: WarehouseFormState;
  onChange: (form: WarehouseFormState) => void;
  managers: Array<{ id: number; username: string; firstName?: string | null; lastName?: string | null }>;
  formError: string | null;
}

function WarehouseForm({ form, onChange, managers, formError }: WarehouseFormProps) {
  return (
    <div className="space-y-4">
      <Input
        id="form-address"
        label="Address / Name"
        placeholder="Cairo Central Warehouse"
        value={form.address}
        onChange={(e) => onChange({ ...form, address: e.target.value })}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          id="form-type"
          label="Type"
          options={[
            { value: 'false', label: 'Branch' },
            { value: 'true', label: 'Central' },
          ]}
          value={String(form.isCentral)}
          onChange={(e) => onChange({ ...form, isCentral: e.target.value === 'true' })}
        />
        <Select
          id="form-status"
          label="Status"
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
          ]}
          value={form.status}
          onChange={(e) => onChange({ ...form, status: e.target.value as WarehouseStatus })}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="form-phone"
          label="Phone"
          placeholder="+20 ..."
          value={form.phone}
          onChange={(e) => onChange({ ...form, phone: e.target.value })}
        />
        <Select
          id="form-manager"
          label="Manager"
          options={[
            { value: '', label: 'No manager' },
            ...managers.map((m) => ({
              value: String(m.id),
              label: `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.username,
            })),
          ]}
          value={form.managerUserId}
          onChange={(e) => onChange({ ...form, managerUserId: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
        <textarea
          className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          rows={3}
          value={form.notes}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
        />
      </div>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
    </div>
  );
}
