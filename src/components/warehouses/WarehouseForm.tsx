'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { warehouseSchema, WarehouseFormData } from '@/lib/validators';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Warehouse } from '@/types/warehouse.types';

interface WarehouseFormProps {
  initialData?: Warehouse;
  onSubmit: (data: WarehouseFormData) => void;
  isLoading?: boolean;
}

export default function WarehouseForm({ initialData, onSubmit, isLoading }: WarehouseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: initialData
      ? { address: initialData.address, isCentral: initialData.isCentral }
      : { isCentral: false },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        id="address"
        label="Warehouse Address"
        placeholder="Enter warehouse address"
        error={errors.address?.message}
        {...register('address')}
      />
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isCentral"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          {...register('isCentral')}
        />
        <label htmlFor="isCentral" className="text-sm font-medium text-gray-700">
          Central Warehouse
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Warehouse' : 'Create Warehouse'}
        </Button>
      </div>
    </form>
  );
}