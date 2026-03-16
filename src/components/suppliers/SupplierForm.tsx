'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema, SupplierFormData } from '@/lib/validators';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Supplier } from '@/types/supplier.types';

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (data: SupplierFormData) => void;
  isLoading?: boolean;
}

export default function SupplierForm({ initialData, onSubmit, isLoading }: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          address: initialData.address,
          phoneNumber: initialData.phoneNumber,
        }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        id="name"
        label="Supplier Name"
        placeholder="Enter supplier name"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        id="phoneNumber"
        label="Phone Number"
        placeholder="Enter phone number"
        error={errors.phoneNumber?.message}
        {...register('phoneNumber')}
      />
      <Input
        id="address"
        label="Address"
        placeholder="Enter supplier address"
        error={errors.address?.message}
        {...register('address')}
      />
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Supplier' : 'Create Supplier'}
        </Button>
      </div>
    </form>
  );
}