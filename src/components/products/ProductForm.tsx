'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productSchema, ProductFormData } from '@/lib/validators';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Product } from '@/types/product.types';

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isLoading }: ProductFormProps) {
  const { data: categoriesData } = useCategories({ size: 100 });
  const { data: suppliersData } = useSuppliers({ size: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof productSchema>, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      sku: initialData?.sku ?? '',
      barcode: initialData?.barcode ?? '',
      description: initialData?.description ?? '',
      photo: initialData?.photo ?? '',
      currentPrice: initialData?.currentPrice ?? 0,
      costPrice: initialData?.costPrice ?? 0,
      openingStock: initialData?.openingStock ?? 0,
      reorderLevel: initialData?.reorderLevel ?? 0,
      unitOfMeasure: initialData?.unitOfMeasure ?? 'pcs',
      brand: initialData?.brand ?? '',
      manufacturer: initialData?.manufacturer ?? '',
      status: initialData?.status ?? 'ACTIVE',
      taxCategory: initialData?.taxCategory ?? '',
      isSerialTracked: initialData?.isSerialTracked ?? false,
      isBatchTracked: initialData?.isBatchTracked ?? false,
      categoryId: initialData?.categoryId,
      supplierId: initialData?.supplierId,
    },
  });

  const categoryOptions = (categoriesData?.content || []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const supplierOptions = (suppliersData?.content || []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="name"
          label="Product Name"
          placeholder="Enter product name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="sku"
          label="SKU"
          placeholder="SKU-WIDGET-001"
          error={errors.sku?.message}
          {...register('sku')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          id="barcode"
          label="Barcode"
          placeholder="Optional barcode"
          error={errors.barcode?.message}
          {...register('barcode')}
        />
        <Input
          id="unitOfMeasure"
          label="Unit"
          placeholder="pcs, kg, box"
          error={errors.unitOfMeasure?.message}
          {...register('unitOfMeasure')}
        />
        <Select
          id="status"
          label="Status"
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'DISCONTINUED', label: 'Discontinued' },
          ]}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="currentPrice"
          label="Selling Price"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.currentPrice?.message}
          {...register('currentPrice', { valueAsNumber: true })}
        />
        <Input
          id="costPrice"
          label="Cost Price"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.costPrice?.message}
          {...register('costPrice', { valueAsNumber: true })}
        />
      </div>

      <Input
        id="description"
        label="Description"
        placeholder="Enter product description"
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="brand"
          label="Brand"
          placeholder="Optional brand"
          error={errors.brand?.message}
          {...register('brand')}
        />
        <Input
          id="manufacturer"
          label="Manufacturer"
          placeholder="Optional manufacturer"
          error={errors.manufacturer?.message}
          {...register('manufacturer')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          id="categoryId"
          label="Category"
          placeholder="Select a category"
          options={categoryOptions}
          error={errors.categoryId?.message}
          {...register('categoryId', { valueAsNumber: true })}
        />
        <Select
          id="supplierId"
          label="Supplier"
          placeholder="Select a supplier"
          options={supplierOptions}
          error={errors.supplierId?.message}
          {...register('supplierId', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          id="openingStock"
          label="Opening Stock"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          error={errors.openingStock?.message}
          {...register('openingStock', { valueAsNumber: true })}
        />
        <Input
          id="reorderLevel"
          label="Reorder Level"
          type="number"
          min="0"
          step="1"
          placeholder="0"
          error={errors.reorderLevel?.message}
          {...register('reorderLevel', { valueAsNumber: true })}
        />
        <Input
          id="taxCategory"
          label="Tax Category"
          placeholder="Optional"
          error={errors.taxCategory?.message}
          {...register('taxCategory')}
        />
      </div>

      <Input
        id="photo"
        label="Photo URL"
        placeholder="https://images.unsplash.com/..."
        error={errors.photo?.message}
        {...register('photo')}
      />

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-2">
        <label className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            {...register('isSerialTracked')}
          />
          Serial number tracked
        </label>
        <label className="flex items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            {...register('isBatchTracked')}
          />
          Batch / lot tracked
        </label>
        {errors.isBatchTracked?.message && (
          <p className="text-xs text-red-500 md:col-span-2">{errors.isBatchTracked.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
