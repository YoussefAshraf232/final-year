'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sidebarLinks } from '@/constants/sidebar-links';
import { useAuth } from '@/hooks/useAuth';
import { useSidebarStore } from '@/stores/sidebar.store';
import SidebarItem from './SidebarItem';
import { getInitials } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const isOpen = useSidebarStore((s) => s.isOpen);
  const close = useSidebarStore((s) => s.close);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">IMS</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Inventory MS</h1>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {sidebarLinks.map((link) => {
            // Hide admin-only links
            if (link.adminOnly && !isAdmin) return null;

            // Has children (dropdown)
            if ('children' in link && link.children) {
              return (
                <SidebarDropdown
                  key={link.label}
                  label={link.label}
                  icon={link.icon}
                  items={link.children}
                  pathname={pathname}
                />
              );
            }

            // Regular link
            return (
              <SidebarItem
                key={link.href!}
                href={link.href!}
                label={link.label}
                icon={link.icon!}
                isActive={pathname === link.href}
                onClick={close}
              />
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
              {user ? getInitials(user.username) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Dropdown component for invoice sub-menu
function SidebarDropdown({
  label,
  icon: Icon,
  items,
  pathname,
}: {
  label: string;
  icon: any;
  items: { label: string; href: string }[];
  pathname: string;
}) {
  const isChildActive = items.some((item) => pathname.startsWith(item.href));
  const [isExpanded, setIsExpanded] = useState(isChildActive);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          isChildActive
            ? 'text-indigo-700 bg-indigo-50'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        )}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      {isExpanded && (
        <div className="ml-5 mt-1 space-y-1 border-l-2 border-gray-100 pl-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-lg text-sm transition-colors',
                pathname.startsWith(item.href)
                  ? 'text-indigo-700 bg-indigo-50 font-medium'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}