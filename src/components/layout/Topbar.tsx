'use client';

import { Menu, Bell } from 'lucide-react';
import { useSidebarStore } from '@/stores/sidebar.store';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  const toggle = useSidebarStore((s) => s.toggle);

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
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Notifications">
            <Bell className="h-5 w-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}