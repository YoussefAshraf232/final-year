'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createUserSchema,
  updateUserSchema,
  CreateUserFormData,
  UpdateUserFormData,
} from '@/lib/validators';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { Role, User } from '@/types/user.types';
import { Warehouse } from '@/types/warehouse.types';

interface CreateUserFormProps {
  mode: 'create';
  roles: Role[];
  rolesLoading?: boolean;
  onSubmit: (data: CreateUserFormData) => void;
  isLoading?: boolean;
}

interface UpdateUserFormProps {
  mode: 'edit';
  user: User & { roleId?: number };
  roles: Role[];
  warehouses: Warehouse[];
  rolesLoading?: boolean;
  warehousesLoading?: boolean;
  onSubmit: (data: UpdateUserFormData) => void;
  isLoading?: boolean;
}

type Props = CreateUserFormProps | UpdateUserFormProps;
type RoleOption = { value: number; label: string };

export default function UserForm(props: Props) {
  const roleOptions: RoleOption[] = props.roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));
  if (props.mode === 'create') {
    return <CreateForm {...props} roleOptions={roleOptions} />;
  }
  return <EditForm {...props} roleOptions={roleOptions} />;
}

function CreateForm({
  roleOptions,
  rolesLoading,
  onSubmit,
  isLoading,
}: CreateUserFormProps & { roleOptions: RoleOption[] }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof createUserSchema>, unknown, CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      password: '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="username"
        label="Username"
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="firstName"
          label="First name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          id="lastName"
          label="Last name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
      <Input
        id="phoneNumber"
        label="Phone number"
        autoComplete="tel"
        error={errors.phoneNumber?.message}
        {...register('phoneNumber')}
      />
      <Input
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Select
        id="roleId"
        label="Role"
        placeholder={rolesLoading ? 'Loading roles...' : 'Select role'}
        options={roleOptions}
        error={errors.roleId?.message}
        {...register('roleId', { valueAsNumber: true })}
      />
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="submit" isLoading={isLoading}>
          Create user
        </Button>
      </div>
    </form>
  );
}

function EditForm({
  user,
  roleOptions,
  warehouses,
  rolesLoading,
  warehousesLoading,
  onSubmit,
  isLoading,
}: UpdateUserFormProps & { roleOptions: RoleOption[] }) {
  const [selectedWarehouseIds, setSelectedWarehouseIds] = useState<number[]>(
    () => user.assignedWarehouses?.map((warehouse) => warehouse.id) ?? []
  );
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof updateUserSchema>, unknown, UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: user.username,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phoneNumber: user.phoneNumber ?? '',
      email: user.email,
      password: '',
      roleId: user.roleId,
    },
  });
  const selectedRoleId = watch('roleId');
  const selectedRole = roleOptions.find((role) => role.value === selectedRoleId);
  const currentRoleName = selectedRole?.label ?? user.roleName ?? user.role;
  const showWarehouseAssignment =
    currentRoleName === 'WAREHOUSE_MANAGER' || currentRoleName === 'EMPLOYEE';

  const submit = (data: UpdateUserFormData) => {
    onSubmit({
      ...data,
      warehouseIds: showWarehouseAssignment ? selectedWarehouseIds : [],
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <Input
        id="editUsername"
        label="Username"
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          id="firstName"
          label="First name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          id="lastName"
          label="Last name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
      <Input
        id="phoneNumber"
        label="Phone number"
        error={errors.phoneNumber?.message}
        {...register('phoneNumber')}
      />
      <Input
        id="email"
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        id="editPassword"
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <Select
        id="roleId"
        label="Role"
        placeholder={rolesLoading ? 'Loading roles...' : 'Select role'}
        options={roleOptions}
        error={errors.roleId?.message}
        {...register('roleId', { valueAsNumber: true })}
      />
      {showWarehouseAssignment && (
        <div>
          <span className="mb-1.5 block text-sm font-medium text-gray-700">
            Assigned warehouses
          </span>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-gray-300 bg-white p-3">
            {warehouses.map((warehouse) => (
              <label key={warehouse.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  value={warehouse.id}
                  checked={selectedWarehouseIds.includes(warehouse.id)}
                  disabled={warehousesLoading}
                  onChange={(event) => {
                    setSelectedWarehouseIds((current) =>
                      event.target.checked
                        ? [...current, warehouse.id]
                        : current.filter((id) => id !== warehouse.id)
                    );
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{warehouse.address}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button type="submit" isLoading={isLoading}>
          Update user
        </Button>
      </div>
    </form>
  );
}
