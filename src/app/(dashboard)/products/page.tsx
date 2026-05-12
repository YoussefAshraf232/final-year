'use client';

import { useMemo, useState } from 'react';
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
import ProductFormFields from '@/components/products/ProductFormFields';
import ProductDetailsDrawer from '@/components/products/ProductDetailsDrawer';
import {
  useProducts,
  useProductStats,
  useCreateProduct,
  useUpdateProduct,
  useDeactivateProduct,
} from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { usePagination } from '@/hooks/usePagination';
import {
  Product,
  ProductStatus,
  StockStatus,
} from '@/types/product.types';
import { ProductFormData } from '@/lib/validators';
import { downloadCsv } from '@/lib/exportCsv';
import { formatCurrency } from '@/lib/formatters';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  XCircle,
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

function stockBadge(status?: StockStatus) {
  if (status === 'IN_STOCK') return <Badge variant="success">In Stock</Badge>;
  if (status === 'LOW_STOCK') return <Badge variant="warning">Low Stock</Badge>;
  if (status === 'OUT_OF_STOCK') return <Badge variant="danger">Out of Stock</Badge>;
  return <Badge variant="default">Unknown</Badge>;
}

function statusBadge(status?: string) {
  if (status === 'ACTIVE') return <Badge variant="success">Active</Badge>;
  if (status === 'INACTIVE') return <Badge variant="default">Inactive</Badge>;
  if (status === 'DISCONTINUED') return <Badge variant="danger">Discontinued</Badge>;
  return null;
}

export default function ProductsPage() {
  const { isGuest, isSystemAdmin, isOperationalManager } = useAuth();
  const canManage = !isGuest && (isSystemAdmin || isOperationalManager);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [supplierId, setSupplierId] = useState<string>('');
  const [stockStatus, setStockStatus] = useState<StockStatus | ''>('');
  const [status, setStatus] = useState<ProductStatus | ''>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Product | undefined>();
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { page, setPage, resetPage, paginationParams } = usePagination({ initialSize: 10 });

  const filters = {
    ...paginationParams,
    search: debouncedSearch || undefined,
    categoryId: categoryId ? Number(categoryId) : undefined,
    supplierId: supplierId ? Number(supplierId) : undefined,
    stockStatus: (stockStatus || undefined) as StockStatus | undefined,
    status: (status || undefined) as ProductStatus | undefined,
  };

  const { data, isLoading, error, refetch } = useProducts(filters, { enabled: !isGuest });
  const { data: stats } = useProductStats({ enabled: !isGuest });
  const { data: categoriesData } = useCategories({ size: 100 }, { enabled: !isGuest });
  const { data: suppliersData } = useSuppliers({ size: 100 }, { enabled: !isGuest });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deactivateProduct = useDeactivateProduct();

  const products = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  const isFiltered =
    !!debouncedSearch || !!categoryId || !!supplierId || !!stockStatus || !!status;

  const clearFilters = () => {
    setSearch('');
    setCategoryId('');
    setSupplierId('');
    setStockStatus('');
    setStatus('');
    resetPage();
  };

  const handleCreate = async (formData: ProductFormData) => {
    try {
      await createProduct.mutateAsync({
        name: formData.name,
        sku: formData.sku,
        description: formData.description || undefined,
        currentPrice: formData.currentPrice,
        costPrice: formData.costPrice ?? undefined,
        reorderLevel: formData.reorderLevel ?? 0,
        status: formData.status,
        supplierId: formData.supplierId,
        categoryIds: formData.categoryIds,
      });
      setCreateOpen(false);
      toast.success('Product created');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create product'));
    }
  };

  const handleUpdate = async (formData: ProductFormData) => {
    if (!editingProduct) return;
    try {
      await updateProduct.mutateAsync({
        id: editingProduct.id,
        data: {
          name: formData.name,
          sku: formData.sku,
          description: formData.description || undefined,
          currentPrice: formData.currentPrice,
          costPrice: formData.costPrice ?? undefined,
          reorderLevel: formData.reorderLevel ?? 0,
          status: formData.status,
          supplierId: formData.supplierId,
          categoryIds: formData.categoryIds,
        },
      });
      setEditingProduct(undefined);
      toast.success('Product updated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not update product'));
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateProduct.mutateAsync(deactivateTarget.id);
      setDeactivateTarget(undefined);
      setSelectedId(null);
      toast.success('Product deactivated');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not deactivate product'));
    }
  };

  const handleExport = () => {
    downloadCsv('products.csv', [
      { label: 'ID', value: (p: Product) => p.id },
      { label: 'Name', value: (p: Product) => p.name },
      { label: 'SKU', value: (p: Product) => p.sku ?? '' },
      { label: 'Category', value: (p: Product) => p.categories?.[0]?.name ?? '' },
      { label: 'Supplier', value: (p: Product) => p.supplier?.name ?? '' },
      { label: 'Selling Price', value: (p: Product) => p.currentPrice },
      { label: 'Stock Status', value: (p: Product) => p.stockStatus ?? '' },
      { label: 'Status', value: (p: Product) => p.status ?? '' },
    ], products);
  };

  const categoryOptions = useMemo(
    () => (categoriesData?.content ?? []).map((c) => ({ value: c.id, label: c.name })),
    [categoriesData],
  );
  const supplierOptions = useMemo(
    () => (suppliersData?.content ?? []).map((s) => ({ value: s.id, label: s.name })),
    [suppliersData],
  );

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (p: Product) => (
        <div>
          <p className="font-medium text-gray-900">{p.name}</p>
          <p className="text-xs text-gray-500 line-clamp-1">
            {p.description || 'No description'}
          </p>
        </div>
      ),
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (p: Product) => (
        <span className="font-mono text-xs text-gray-700">{p.sku ?? '—'}</span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (p: Product) => (
        <Badge variant="info">{p.categories?.[0]?.name ?? 'N/A'}</Badge>
      ),
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (p: Product) => (
        <span className="text-gray-600">{p.supplier?.name ?? 'N/A'}</span>
      ),
    },
    {
      key: 'currentPrice',
      label: 'Selling Price',
      render: (p: Product) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(p.currentPrice)}
        </span>
      ),
    },
    {
      key: 'stockStatus',
      label: 'Stock Status',
      render: (p: Product) => stockBadge(p.stockStatus),
    },
    {
      key: 'status',
      label: 'Status',
      render: (p: Product) => statusBadge(p.status) ?? <span className="text-gray-400">—</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'w-32',
      render: (p: Product) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(p.id);
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
                  setEditingProduct(p);
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
                  setDeactivateTarget(p);
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
      <Topbar title="Products" subtitle="Manage your inventory items" />

      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <BreadCrumb items={[{ label: 'Products' }, { label: 'Manage Products' }]} />
          {canManage && (
            <div className="flex items-center gap-2">
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> New Product
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4" /> Export CSV
              </Button>
            </div>
          )}
        </div>

        {isGuest && <DemoModeBanner resource="products" />}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<Boxes className="h-5 w-5 text-indigo-600" />}
            iconBg="bg-indigo-50"
            label="Total Products"
            value={stats?.totalProducts ?? 0}
            sub="All products in system"
          />
          <KpiCard
            icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="Active Products"
            value={stats?.activeProducts ?? 0}
            sub="Currently active"
          />
          <KpiCard
            icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
            iconBg="bg-amber-50"
            label="Low Stock Products"
            value={stats?.lowStockProducts ?? 0}
            sub="Below reorder level"
          />
          <KpiCard
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-50"
            label="Out of Stock Products"
            value={stats?.outOfStockProducts ?? 0}
            sub="No available stock"
          />
        </div>

        {error && !isGuest ? (
          <ErrorState
            title="Could not load products"
            message="Check that the backend is running and your session is valid."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
              <Input
                id="search"
                label="Search"
                placeholder="Search by name, SKU, or supplier..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
              />
              <Select
                id="categoryFilter"
                label="Category"
                placeholder="All Categories"
                options={categoryOptions}
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  resetPage();
                }}
              />
              <Select
                id="supplierFilter"
                label="Supplier"
                placeholder="All Suppliers"
                options={supplierOptions}
                value={supplierId}
                onChange={(e) => {
                  setSupplierId(e.target.value);
                  resetPage();
                }}
              />
              <Select
                id="stockStatusFilter"
                label="Stock Status"
                placeholder="All Stock Statuses"
                options={[
                  { value: 'IN_STOCK', label: 'In Stock' },
                  { value: 'LOW_STOCK', label: 'Low Stock' },
                  { value: 'OUT_OF_STOCK', label: 'Out of Stock' },
                ]}
                value={stockStatus}
                onChange={(e) => {
                  setStockStatus(e.target.value as StockStatus | '');
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
                  { value: 'DISCONTINUED', label: 'Discontinued' },
                ]}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as ProductStatus | '');
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
                data={products}
                keyExtractor={(p) => p.id}
                isLoading={isLoading}
                emptyMessage={
                  isFiltered ? 'No records match the current filters.' : 'No products found.'
                }
                onRowClick={(p) => setSelectedId(p.id)}
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
        title="New Product"
        size="xl"
      >
        <ProductFormFields
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          isLoading={createProduct.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(undefined)}
        title="Edit Product"
        size="xl"
      >
        {editingProduct && (
          <ProductFormFields
            initialData={editingProduct}
            onSubmit={handleUpdate}
            onCancel={() => setEditingProduct(undefined)}
            isLoading={updateProduct.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(undefined)}
        onConfirm={handleDeactivate}
        title="Deactivate Product"
        message="Deactivate this product? Existing sales, purchases, and stock history will be kept."
        confirmLabel="Deactivate"
        isLoading={deactivateProduct.isPending}
      />

      <ProductDetailsDrawer
        productId={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={(p) => {
          setSelectedId(null);
          setEditingProduct(p);
        }}
        onDeactivate={(p) => setDeactivateTarget(p)}
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
