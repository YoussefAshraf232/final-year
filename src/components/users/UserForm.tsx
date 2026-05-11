'use client';

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
  rolesLoading?: boolean;
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
  rolesLoading,
  onSubmit,
  isLoading,
}: UpdateUserFormProps & { roleOptions: RoleOption[] }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof updateUserSchema>, unknown, UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phoneNumber: user.phoneNumber ?? '',
      email: user.email,
      roleId: user.roleId,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          Update user
        </Button>
      </div>
    </form>
  );
}
