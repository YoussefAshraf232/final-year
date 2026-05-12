'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerFormData } from '@/lib/validators';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Customer } from '@/types/customer.types';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  isLoading?: boolean;
}

export default function CustomerForm({ initialData, onSubmit, isLoading }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      address: initialData?.address ?? '',
      notes: initialData?.notes ?? '',
      status: initialData?.status ?? 'ACTIVE',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="name"
        label="Name"
        placeholder="Customer name"
        error={errors.name?.message}
        {...register('name')}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="phone"
          label="Phone"
          placeholder="Phone number"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="billing@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>
      <Input
        id="address"
        label="Address"
        placeholder="Customer address"
        error={errors.address?.message}
        {...register('address')}
      />
      <Input
        id="notes"
        label="Notes"
        placeholder="Internal notes"
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
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}
