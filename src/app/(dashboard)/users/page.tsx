'use client';

import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import DemoModeBanner from '@/components/ui/DemoModeBanner';
import ErrorState from '@/components/ui/ErrorState';
import Input from '@/components/ui/Input';
import Pagination from '@/components/ui/Pagination';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import UserForm from '@/components/users/UserForm';
import { ROLE_COLORS } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { CreateUserFormData, UpdateUserFormData } from '@/lib/validators';
import { Role, User, UserRole } from '@/types/user.types';
import { Edit, Plus, Trash2 } from 'lucide-react';

const fallbackUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'ADMIN',
    joinedAt: '2024-01-01T00:00:00Z',
    leftAt: null,
  },
  {
    id: 2,
    username: 'manager1',
    email: 'manager@example.com',
    role: 'MANAGER',
    joinedAt: '2024-01-05T00:00:00Z',
    leftAt: null,
  },
  {
    id: 3,
    username: 'employee1',
    email: 'employee@example.com',
    role: 'EMPLOYEE',
    joinedAt: '2024-01-10T00:00:00Z',
    leftAt: null,
  },
];

const SYSTEM_ADMIN_ROLES = new Set(['ADMIN', 'SYSTEM_ADMIN']);

function getUserRoleName(user: User): string {
  return (user.roleName || (user.role as string) || '').toString();
}

function isSystemAdminRole(roleName: string | undefined): boolean {
  return !!roleName && SYSTEM_ADMIN_ROLES.has(roleName.toUpperCase());
}

function findRoleIdByName(
  roles: Role[] | undefined,
  name: string | undefined
): number | undefined {
  if (!name) return undefined;
  return roles?.find((role) => role.name === name)?.id;
}

function errorMessage(err: unknown, fallback: string): string {
  const error = err as { response?: { data?: { message?: string; error?: string } } };
  return error?.response?.data?.message || error?.response?.data?.error || fallback;
}

export default function UsersPage() {
  const { user: currentUser, isGuest, isSystemAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { page, setPage, resetPage, paginationParams } = usePagination({
    initialSize: 10,
  });
  const showDemoData = isGuest;
  const canManage = !showDemoData && isSystemAdmin;

  const { data, isLoading, error, refetch } = useUsers(
    { ...paginationParams, search: debouncedSearch || undefined },
    { enabled: canManage }
  );

  const { data: roles, isLoading: rolesLoading } = useRoles({
    enabled: canManage,
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const showError = canManage && !!error;
  const backendUsers = data?.content ?? [];
  const baseUsers = showDemoData ? fallbackUsers : backendUsers;

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return baseUsers;
    const query = debouncedSearch.toLowerCase();
    return baseUsers.filter(
      (u) =>
        u.username.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }, [baseUsers, debouncedSearch]);

  const handleCreate = async (form: CreateUserFormData) => {
    try {
      await createUser.mutateAsync({ ...form, roleId: form.roleId as number });
      toast.success('User created');
      setCreateOpen(false);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to create user'));
    }
  };

  const handleUpdate = async (form: UpdateUserFormData) => {
    if (!editTarget) return;
    try {
      await updateUser.mutateAsync({ id: editTarget.id, data: form });
      toast.success('User updated');
      setEditTarget(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to update user'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const targetRoleName = getUserRoleName(deleteTarget);
    if (isSystemAdminRole(targetRoleName)) {
      toast.error('System admin accounts cannot be deleted');
      setDeleteTarget(null);
      return;
    }
    if (currentUser && deleteTarget.id === currentUser.id) {
      toast.error('You cannot remove your own account');
      setDeleteTarget(null);
      return;
    }
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      toast.success('User removed');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to remove user'));
    }
  };

  const editRoleId = editTarget
    ? editTarget.roleId ?? findRoleIdByName(roles, getUserRoleName(editTarget))
    : undefined;

  if (!showDemoData && !isSystemAdmin) {
    return (
      <>
        <Topbar title="Access Denied" />
        <div className="p-6">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">
                User management is restricted to system administrators.
              </p>
            </div>
          </Card>
        </div>
      </>
    );
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'w-12',
      render: (u: User) => (
        <span className="text-gray-400 font-mono text-xs">#{u.id}</span>
      ),
    },
    {
      key: 'username',
      label: 'Username',
      render: (u: User) => (
        <span className="font-medium text-gray-900">{u.username}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (u: User) => (
        <span className="text-gray-600 text-sm">{u.email}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (u: User) => {
        const roleName = getUserRoleName(u);
        const variant = ROLE_COLORS[roleName as UserRole] ?? 'info';
        return <Badge variant={variant}>{roleName || '—'}</Badge>;
      },
    },
  ];

  if (canManage) {
    columns.push({
      key: 'actions',
      label: '',
      className: 'w-24',
      render: (u: User) => {
        const roleName = getUserRoleName(u);
        const isProtected =
          isSystemAdminRole(roleName) || (currentUser && currentUser.id === u.id);

        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditTarget(u)}
              aria-label={`Edit ${u.username}`}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !isProtected && setDeleteTarget(u)}
              disabled={isProtected}
              aria-label={
                isProtected
                  ? 'System admins cannot be deleted'
                  : `Delete ${u.username}`
              }
              title={isProtected ? 'System admins cannot be deleted' : undefined}
              className={isProtected ? 'text-gray-300' : 'text-red-500'}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    });
  }

  return (
    <>
      <Topbar title="Users" subtitle="Manage system users and permissions" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Users' }]} />

        {showDemoData && <DemoModeBanner resource="users" />}

        {showError ? (
          <ErrorState
            title="Could not load users"
            message="Check your connection or contact your administrator."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 flex items-end justify-between gap-3 flex-wrap">
              <div className="max-w-md w-full">
                <Input
                  id="user-search"
                  label="Search"
                  placeholder="Search users"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    resetPage();
                  }}
                />
              </div>
              {canManage && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Add User
                </Button>
              )}
            </div>

            <Table
              columns={columns}
              data={filteredUsers}
              keyExtractor={(u) => u.id}
              isLoading={canManage && isLoading}
              emptyMessage="No users found"
            />

            {canManage && data && (
              <Pagination
                page={page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                isFirst={data.first}
                isLast={data.last}
                onPageChange={setPage}
              />
            )}
          </Card>
        )}
      </div>

      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add user"
        size="lg"
      >
        <UserForm
          mode="create"
          roles={roles ?? []}
          rolesLoading={rolesLoading}
          onSubmit={handleCreate}
          isLoading={createUser.isPending}
        />
      </Modal>

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit user"
        size="lg"
      >
        {editTarget && (
          <UserForm
            mode="edit"
            user={{ ...editTarget, roleId: editRoleId }}
            roles={roles ?? []}
            rolesLoading={rolesLoading}
            onSubmit={handleUpdate}
            isLoading={updateUser.isPending}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Remove user"
        message={
          deleteTarget
            ? `Remove ${deleteTarget.username}? This cannot be undone.`
            : ''
        }
        confirmLabel="Remove"
        isLoading={deleteUser.isPending}
      />
    </>
  );
}
