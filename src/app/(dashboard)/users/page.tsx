'use client';

import { useState, useMemo } from 'react';
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
import { ROLE_COLORS } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { User } from '@/types/user.types';
import { Edit, Trash2 } from 'lucide-react';

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

export default function UsersPage() {
  const { isGuest, isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 300);
  const { page, setPage, resetPage, paginationParams } = usePagination({
    initialSize: 10,
  });
  const showDemoData = isGuest;

  const { data, isLoading, error, refetch } = useUsers(
    { ...paginationParams, search: debouncedSearch || undefined },
    { enabled: isAdmin && !showDemoData }
  );

  const showError = !showDemoData && !!error;
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

  if (!showDemoData && !isAdmin) {
    return (
      <>
        <Topbar title="Access Denied" />
        <div className="p-6">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">
                You do not have permission to view this page.
              </p>
              <p className="mt-2 text-sm text-gray-400">
                User management requires the <span className="font-medium">user.view</span> permission.
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
      render: (u: User) => (
        <Badge variant={ROLE_COLORS[u.role]}>{u.role}</Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      className: 'w-24',
      render: () => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Topbar title="Users" subtitle="Manage system users and permissions" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Users' }]} />

        {showDemoData && <DemoModeBanner resource="users" />}

        {showError ? (
          <ErrorState
            title="Could not load users"
            message="Authenticated admins are not shown demo users when the API fails."
            onRetry={() => void refetch()}
          />
        ) : (
          <Card>
            <div className="mb-4 max-w-md">
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

            <Table
              columns={columns}
              data={filteredUsers}
              keyExtractor={(u) => u.id}
              isLoading={!showDemoData && isLoading}
              emptyMessage="No users found"
            />

            {!showDemoData && data && (
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
    </>
  );
}
