'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerFormData } from '@/lib/validators';
import Input from '@/components/ui/Input';
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
    defaultValues: initialData
      ? { name: initialData.name, address: initialData.address }
      : undefined,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        id="name"
        label="Customer Name"
        placeholder="Enter customer name"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        id="address"
        label="Address"
        placeholder="Enter customer address"
        error={errors.address?.message}
        {...register('address')}
      />
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="submit" isLoading={isLoading}>
          {initialData ? 'Update Customer' : 'Create Customer'}
        </Button>
      </div>
    </form>
  );
}