'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          photo: initialData.photo,
          currentPrice: initialData.currentPrice,
          categoryId: initialData.categoryId,
          supplierId: initialData.supplierId,
        }
      : undefined,
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
          id="currentPrice"
          label="Price"
          type="number"
          step="0.01"
          placeholder="0.00"
          error={errors.currentPrice?.message}
          {...register('currentPrice', { valueAsNumber: true })}
        />
      </div>

      <Input
        id="description"
        label="Description"
        placeholder="Enter product description"
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        id="photo"
        label="Photo URL"
        placeholder="https://example.com/image.jpg"
        error={errors.photo?.message}
        {...register('photo')}
      />

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

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}