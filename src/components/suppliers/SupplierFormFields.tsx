'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supplierSchema, SupplierFormData } from '@/lib/validators';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Supplier } from '@/types/supplier.types';

interface SupplierFormProps {
  initialData?: Supplier;
  onSubmit: (data: SupplierFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function SupplierFormFields({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  submitLabel,
}: SupplierFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      phone: initialData?.phone ?? '',
      address: initialData?.address ?? '',
      email: initialData?.email ?? '',
      contactPerson: initialData?.contactPerson ?? '',
      notes: initialData?.notes ?? '',
      status: initialData?.status ?? 'ACTIVE',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="name"
          label="Supplier Name"
          placeholder="Enter supplier name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="contactPerson"
          label="Contact Person"
          placeholder="Enter contact person"
          error={errors.contactPerson?.message}
          {...register('contactPerson')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          id="phone"
          label="Phone"
          placeholder="Enter phone number"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="contact@supplier.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      <Input
        id="address"
        label="Address"
        placeholder="Enter supplier address"
        error={errors.address?.message}
        {...register('address')}
      />
      <Input
        id="notes"
        label="Notes"
        placeholder="Optional notes about this supplier"
        error={errors.notes?.message}
        {...register('notes')}
      />
      <Select
        id="status"
        label="Status"
        options={[
          { value: 'ACTIVE', label: 'Active' },
          { value: 'INACTIVE', label: 'Inactive' },
        ]}
        error={errors.status?.message}
        {...register('status')}
      />
      <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {submitLabel ?? (initialData ? 'Update Supplier' : 'Create Supplier')}
        </Button>
      </div>
    </form>
  );
}
