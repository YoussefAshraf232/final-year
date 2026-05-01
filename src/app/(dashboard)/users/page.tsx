'use client';

import { useState, useMemo } from 'react';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROLE_COLORS } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
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
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || isGuest;

  const { data, isLoading, error } = useUsers(
    { page: 0, size: 100, search: debouncedSearch || undefined },
    { enabled: isAdmin && !isDemoMode }
  );

  const showDemoData = isDemoMode;
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

  if (!isAdmin) {
    return (
      <>
        <Topbar title="Access Denied" />
        <div className="p-6">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">
                You do not have permission to view this page.
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

        {showDemoData && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Showing demo users because demo mode is enabled.
          </div>
        )}

        {error && !showDemoData && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load users. Please check your connection.
          </div>
        )}

        <Card>
          <div className="mb-4 max-w-md">
            <Input
              id="user-search"
              label="Search"
              placeholder="Search users"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <Table
            columns={columns}
            data={filteredUsers}
            keyExtractor={(u) => u.id}
            isLoading={!showDemoData && isLoading}
            emptyMessage="No users found"
          />
        </Card>
      </div>
    </>
  );
}
