'use client';
import { ReactNode } from 'react';
import { useSidebarStore } from '../../stores/sidebar.store';

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const toggleSidebar = useSidebarStore((state) => state.toggle);

    return (
        <div>
            <button onClick={toggleSidebar}>Toggle Sidebar</button>
            {children}
        </div>
    );
}
