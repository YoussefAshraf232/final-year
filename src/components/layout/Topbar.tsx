'use client';

import { Menu, Bell } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar.store';
import { useUnreadNotifications } from '@/hooks/useNotifications';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const toggle = useSidebarStore((s) => s.toggle);
  const { data: notifications } = useUnreadNotifications();
  const unreadCount = notifications?.totalElements ?? 0;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {actions}
          <button
            type="button"
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
            title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
          >
            <Bell className="h-5 w-5 text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-semibold leading-4 text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
