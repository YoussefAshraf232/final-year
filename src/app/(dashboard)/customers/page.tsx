'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import CustomerTable from '@/components/customers/CustomerTable';
import CustomerForm from '@/components/customers/CustomerForm';
import {
  useCreateCustomer,
  useCustomer,
  useCustomers,
  useCustomerSummary,
  useDeactivateCustomer,
  useUpdateCustomer,
} from '@/hooks/useCustomers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import { Customer, CustomerDetail, CustomerSalesActivity, CustomerStatus } from '@/types/customer.types';
import { CustomerFormData } from '@/lib/validators';
import { downloadCsv } from '@/lib/exportCsv';
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters';
import { ROUTES } from '@/constants/routes';
import {
  Ban,
  Building2,
  Calendar,
  Download,
  Edit,
  Mail,
  Phone,
  Plus,
  RefreshCcw,
  RotateCcw,
  ShoppingCart,
  UserRound,
} from 'lucide-react';

const asCurrency = (value?: number) => {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? formatCurrency(amount) : '$0.00';
};

const asDate = (value?: string) => (value ? formatDate(value) : 'N/A');

function errorMessage(err: unknown, fallback: string) {
  if (typeof err === 'object' && err && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message ?? fallback;
  }
  return fallback;
}

export default function CustomersPage() {
  const router = useRouter();
  const { isGuest } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CustomerStatus | ''>('');
  const [salesActivity, setSalesActivity] = useState<CustomerSalesActivity | ''>('');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [selectedId, setSelectedId] = useState<number>();
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Customer | undefined>();
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { page, setPage, resetPage, paginationParams } = usePagination({ initialSize: 8 });

  const filters = {
    ...paginationParams,
    search: debouncedSearch || undefined,
    status: status || undefined,
    salesActivity: salesActivity || undefined,
    createdFrom: createdFrom || undefined,
    createdTo: createdTo || undefined,
  };

  const { data, isLoading, error, refetch } = useCustomers(filters, { enabled: !isGuest });
  const { data: summary } = useCustomerSummary({ enabled: !isGuest });
  const { data: selectedCustomer, isLoading: isLoadingDetails } = useCustomer(selectedId, { enabled: !isGuest });
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deactivateCustomer = useDeactivateCustomer();
  const customers = data?.content ?? [];
  const isFiltered = !!debouncedSearch || !!status || !!salesActivity || !!createdFrom || !!createdTo;

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setSalesActivity('');
    setCreatedFrom('');
    setCreatedTo('');
    resetPage();
  };

  const handleCreate = async (form: CustomerFormData) => {
    try {
      const created = await createCustomer.mutateAsync(form);
      toast.success('Customer created');
      setCreateOpen(false);
      setSelectedId(created.id);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to create customer'));
    }
  };

  const handleUpdate = async (form: CustomerFormData) => {
    if (!editingCustomer) return;
    try {
      const updated = await updateCustomer.mutateAsync({ id: editingCustomer.id, data: form });
      toast.success('Customer updated');
      setEditingCustomer(undefined);
      setSelectedId(updated.id);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update customer'));
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateCustomer.mutateAsync(deactivateTarget.id);
      toast.success('Customer deactivated');
      setDeactivateTarget(undefined);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to deactivate customer'));
    }
  };

  return (
    <>
      <Topbar
        title="Manage Customers"
        subtitle="View, create, and manage your customer records"
        actions={
          <>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New Customer
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                downloadCsv(
                  'customers.csv',
                  [
                    { label: 'Customer ID', value: (row) => row.customerId ?? `CUS-${String(row.id).padStart(4, '0')}` },
                    { label: 'Name', value: (row) => row.name },
                    { label: 'Phone', value: (row) => row.phone },
                    { label: 'Email', value: (row) => row.email },
                    { label: 'Address', value: (row) => row.address },
                    { label: 'Total Sales', value: (row) => row.totalSales },
                    { label: 'Returns', value: (row) => row.returnsCount },
                    { label: 'Status', value: (row) => row.status },
                  ],
                  customers
                )
              }
              disabled={customers.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </>
        }
      />
      <div className="bg-slate-50 p-6">
        <BreadCrumb items={[{ label: 'Customers', href: ROUTES.CUSTOMERS }, { label: 'Manage Customers' }]} />
        {error ? (
          <ErrorState
            title="Could not load customers"
            message="Could not load customers. Check that the backend is running and your session is valid."
            onRetry={() => void refetch()}
          />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <KpiCard icon={<UserRound className="h-5 w-5" />} label="Total Customers" value={summary?.totalCustomers ?? 0} tone="indigo" />
                <KpiCard icon={<UserRound className="h-5 w-5" />} label="Active Customers" value={summary?.activeCustomers ?? 0} tone="emerald" />
                <KpiCard icon={<ShoppingCart className="h-5 w-5" />} label="Customers With Sales" value={summary?.customersWithSales ?? 0} tone="blue" />
                <KpiCard icon={<RotateCcw className="h-5 w-5" />} label="Customers With Returns" value={summary?.customersWithReturns ?? 0} tone="amber" />
              </div>

              <Card>
                <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1.2fr_auto] lg:items-end">
                  <Input
                    id="customer-search"
                    label="Search"
                    placeholder="Search by name, phone, email, or customer ID..."
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      resetPage();
                    }}
                  />
                  <Select
                    id="customer-status"
                    label="Status"
                    value={status}
                    placeholder="All Statuses"
                    options={[
                      { value: 'ACTIVE', label: 'Active' },
                      { value: 'INACTIVE', label: 'Inactive' },
                    ]}
                    onChange={(event) => {
                      setStatus(event.target.value as CustomerStatus | '');
                      resetPage();
                    }}
                  />
                  <Select
                    id="customer-sales-activity"
                    label="Sales Activity"
                    value={salesActivity}
                    placeholder="All"
                    options={[
                      { value: 'HAS_SALES', label: 'Has Sales' },
                      { value: 'NO_SALES', label: 'No Sales' },
                      { value: 'HAS_RETURNS', label: 'Has Returns' },
                    ]}
                    onChange={(event) => {
                      setSalesActivity(event.target.value as CustomerSalesActivity | '');
                      resetPage();
                    }}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Created Date</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input id="created-from" type="date" value={createdFrom} onChange={(event) => { setCreatedFrom(event.target.value); resetPage(); }} />
                      <Input id="created-to" type="date" value={createdTo} onChange={(event) => { setCreatedTo(event.target.value); resetPage(); }} />
                    </div>
                  </div>
                  <Button type="button" variant="outline" onClick={clearFilters}>
                    <RefreshCcw className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </Card>

              <Card>
                {isLoading && <p className="pb-3 text-sm text-gray-500">Loading customers...</p>}
                <CustomerTable
                  customers={customers}
                  isLoading={isLoading}
                  emptyMessage={isFiltered ? 'No records match the current filters.' : 'No customers found.'}
                  onView={(customer) => setSelectedId(customer.id)}
                  onEdit={setEditingCustomer}
                  onDeactivate={setDeactivateTarget}
                />
                {data && (
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
            </div>
            <CustomerDetailsDrawer
              customer={selectedCustomer}
              isLoading={isLoadingDetails}
              onClose={() => setSelectedId(undefined)}
              onEdit={(customer) => setEditingCustomer(customer)}
              onDeactivate={(customer) => setDeactivateTarget(customer)}
              onCreateSale={(customer) => router.push(`${ROUTES.SALES_INVOICES}?customerId=${customer.id}&newSale=true`)}
              onCreateReturn={(customer) => router.push(`${ROUTES.RETURN_INVOICES}?customerId=${customer.id}&newReturn=true`)}
            />
          </div>
        )}
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setCreateOpen(false)} title="New Customer" size="lg">
        <CustomerForm onSubmit={handleCreate} isLoading={createCustomer.isPending} />
      </Modal>

      <Modal isOpen={!!editingCustomer} onClose={() => setEditingCustomer(undefined)} title="Edit Customer" size="lg">
        {editingCustomer && (
          <CustomerForm initialData={editingCustomer} onSubmit={handleUpdate} isLoading={updateCustomer.isPending} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(undefined)}
        onConfirm={handleDeactivate}
        title="Deactivate Customer"
        message="This will mark the customer inactive and preserve all sales and return history."
        confirmLabel="Deactivate Customer"
        isLoading={deactivateCustomer.isPending}
        variant="danger"
      />
    </>
  );
}

function CustomerDetailsDrawer({
  customer,
  isLoading,
  onClose,
  onEdit,
  onDeactivate,
  onCreateSale,
  onCreateReturn,
}: {
  customer?: CustomerDetail;
  isLoading: boolean;
  onClose: () => void;
  onEdit: (customer: CustomerDetail) => void;
  onDeactivate: (customer: CustomerDetail) => void;
  onCreateSale: (customer: CustomerDetail) => void;
  onCreateReturn: (customer: CustomerDetail) => void;
}) {
  return (
    <aside className="min-h-[calc(100vh-8rem)] rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 className="text-base font-semibold text-gray-900">Customer Details</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          x
        </button>
      </div>
      {isLoading ? (
        <p className="p-5 text-sm text-gray-500">Loading customer details...</p>
      ) : !customer ? (
        <p className="p-5 text-sm text-gray-500">Select a customer to view details.</p>
      ) : (
        <div className="space-y-5 p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
              <Building2 className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900">{customer.name}</h3>
              <Badge className="mt-2" variant={customer.status === 'INACTIVE' ? 'warning' : 'success'}>
                {customer.status === 'INACTIVE' ? 'Inactive' : 'Active'}
              </Badge>
              <p className="mt-3 text-sm text-gray-500">Customer ID: {customer.customerId ?? `CUS-${String(customer.id).padStart(4, '0')}`}</p>
            </div>
          </div>

          <Section title="Contact Information">
            <Info icon={<Phone className="h-4 w-4" />} label="Phone" value={customer.phone || '-'} />
            <Info icon={<Mail className="h-4 w-4" />} label="Email" value={customer.email || '-'} />
            <Info icon={<Building2 className="h-4 w-4" />} label="Address" value={customer.address || '-'} />
            <Info icon={<Calendar className="h-4 w-4" />} label="Created At" value={asDate(customer.createdAt)} />
          </Section>

          <Section title="Summary">
            <div className="grid grid-cols-2 gap-4">
              <Metric label="Total Sales" value={asCurrency(customer.totalSales)} />
              <Metric label="Total Returns" value={asCurrency(customer.totalReturns)} />
              <Metric label="Last Sale" value={asDate(customer.lastSale)} />
              <Metric label="Last Return" value={asDate(customer.lastReturn)} />
            </div>
          </Section>

          <ActivitySection
            title="Recent Sales"
            viewAllHref={`${ROUTES.SALES_INVOICES}?customerId=${customer.id}`}
            rows={customer.recentSales ?? []}
          />
          <ActivitySection
            title="Recent Returns"
            viewAllHref={`${ROUTES.RETURN_INVOICES}?customerId=${customer.id}`}
            rows={customer.recentReturns ?? []}
          />

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" onClick={() => onCreateSale(customer)}>
              <ShoppingCart className="h-4 w-4" />
              Create Sale
            </Button>
            <Button type="button" variant="outline" onClick={() => onCreateReturn(customer)}>
              <RotateCcw className="h-4 w-4" />
              Create Return
            </Button>
            <Button type="button" variant="outline" onClick={() => onEdit(customer)}>
              <Edit className="h-4 w-4" />
              Edit Customer
            </Button>
            <Button type="button" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => onDeactivate(customer)}>
              <Ban className="h-4 w-4" />
              Deactivate
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}

function KpiCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: 'indigo' | 'emerald' | 'blue' | 'amber' }) {
  const tones = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <Card className="border border-gray-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatNumber(value)}</p>
        </div>
      </div>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-gray-100 pt-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[22px_80px_1fr] gap-2 text-sm">
      <span className="text-gray-400">{icon}</span>
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function ActivitySection({ title, viewAllHref, rows }: { title: string; viewAllHref: string; rows: { reference: string; date: string; amount: number }[] }) {
  return (
    <section className="border-t border-gray-100 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <a href={viewAllHref} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">View All</a>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No records found.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={`${row.reference}-${row.date}`} className="grid grid-cols-[1fr_auto] gap-2 text-sm">
              <div>
                <p className="font-medium text-gray-900">{row.reference}</p>
                <p className="text-xs text-gray-500">{asDate(row.date)}</p>
              </div>
              <p className="font-semibold text-gray-900">{asCurrency(row.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
