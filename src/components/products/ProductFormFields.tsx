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
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function ProductFormFields({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}: ProductFormProps) {
  const { data: categoriesData } = useCategories({ size: 100 });
  const { data: suppliersData } = useSuppliers({ size: 100 });
  const firstCategoryId = initialData?.categories?.[0]?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof productSchema>, unknown, ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      sku: initialData?.sku ?? '',
      description: initialData?.description ?? '',
      currentPrice: initialData?.currentPrice ?? 0,
      costPrice: initialData?.costPrice ?? undefined,
      reorderLevel: initialData?.reorderLevel ?? 0,
      status: initialData?.status ?? 'ACTIVE',
      categoryIds: firstCategoryId ? [firstCategoryId] : undefined,
      supplierId: initialData?.supplier?.id,
    },
  });

  const categoryOptions = (categoriesData?.content ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const supplierOptions = (suppliersData?.content ?? []).map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
          placeholder="e.g. BCS-1000"
          error={errors.sku?.message}
          {...register('sku')}
        />
      </div>
      <Input
        id="description"
        label="Description"
        placeholder="Enter product description"
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="reorderLevel"
          label="Reorder Level"
          type="number"
          placeholder="0"
          error={errors.reorderLevel?.message}
          {...register('reorderLevel', { valueAsNumber: true })}
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          id="supplierId"
          label="Supplier"
          placeholder="Select a supplier"
          options={supplierOptions}
          error={errors.supplierId?.message}
          {...register('supplierId', { valueAsNumber: true })}
        />
        <Select
          id="categoryIds"
          label="Category"
          placeholder="Select a category"
          options={categoryOptions}
          error={errors.categoryIds?.message}
          {...register('categoryIds.0', { valueAsNumber: true })}
        />
      </div>
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {submitLabel ?? (initialData ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
}
