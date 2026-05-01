'use client';

import { useDashboardStats } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/dashboard/StatCard';
import SalesChart from '@/components/dashboard/SalesChart';
import LowStockAlert from '@/components/dashboard/LowStockAlert';
import RecentInvoices from '@/components/dashboard/RecentInvoices';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import {
  Package,
  Users,
  Truck,
  Warehouse,
  DollarSign,
  ShoppingCart,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

const fallbackStats = {
  totalProducts: 1250,
  totalCustomers: 89,
  totalSuppliers: 34,
  totalWarehouses: 5,
  totalSales: 45678.9,
  totalPurchases: 23456.78,
  totalReturns: 12,
  lowStockProducts: 8,
  recentSalesInvoices: 0,
  recentPurchaseInvoices: 0,
  monthlySalesData: [
    { month: 'Jan', total: 12000 },
    { month: 'Feb', total: 15000 },
    { month: 'Mar', total: 18000 },
    { month: 'Apr', total: 22000 },
    { month: 'May', total: 25000 },
    { month: 'Jun', total: 28000 },
  ],
  monthlyPurchaseData: [
    { month: 'Jan', total: 8000 },
    { month: 'Feb', total: 10000 },
    { month: 'Mar', total: 12000 },
    { month: 'Apr', total: 14000 },
    { month: 'May', total: 16000 },
    { month: 'Jun', total: 18000 },
  ],
};

const fallbackLowStockItems = [
  {
    productId: 1,
    productName: 'Wireless Mouse',
    currentStock: 5,
    minThreshold: 10,
    warehouseName: 'Main Warehouse',
  },
  {
    productId: 2,
    productName: 'USB Cable',
    currentStock: 3,
    minThreshold: 15,
    warehouseName: 'Tech Store',
  },
  {
    productId: 3,
    productName: 'HDMI Cable',
    currentStock: 2,
    minThreshold: 8,
    warehouseName: 'Electronics Hub',
  },
];

const fallbackRecentInvoices = [
  {
    id: 1,
    type: 'sale' as const,
    customerOrSupplier: 'John Doe',
    totalPrice: 299.99,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 2,
    type: 'purchase' as const,
    customerOrSupplier: 'Tech Supplies Inc',
    totalPrice: 1500,
    createdAt: '2024-01-14T14:20:00Z',
  },
  {
    id: 3,
    type: 'sale' as const,
    customerOrSupplier: 'Jane Smith',
    totalPrice: 89.5,
    createdAt: '2024-01-13T09:15:00Z',
  },
];

export default function DashboardPage() {
  const { isGuest } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || isGuest;
  const displayStats = stats || (isDemoMode ? fallbackStats : null);

  if (isLoading && !isDemoMode) {
    return (
      <>
        <Topbar title="Dashboard" subtitle="Overview of your inventory system" />
        <div className="p-6">
          <BreadCrumb items={[{ label: 'Dashboard' }]} />
          <div className="flex items-center justify-center py-16">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"
              aria-label="Loading dashboard"
            />
          </div>
        </div>
      </>
    );
  }

  if (!displayStats) {
    return (
      <>
        <Topbar title="Dashboard" subtitle="Overview of your inventory system" />
        <div className="p-6">
          <BreadCrumb items={[{ label: 'Dashboard' }]} />
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load dashboard data. Please check your connection.
          </div>
        </div>
      </>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: displayStats.totalProducts,
      icon: Package,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      title: 'Total Customers',
      value: displayStats.totalCustomers,
      icon: Users,
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
    },
    {
      title: 'Total Suppliers',
      value: displayStats.totalSuppliers,
      icon: Truck,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
    {
      title: 'Total Warehouses',
      value: displayStats.totalWarehouses,
      icon: Warehouse,
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-50',
    },
    {
      title: 'Total Sales',
      value: `$${displayStats.totalSales.toLocaleString()}`,
      icon: DollarSign,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      title: 'Total Purchases',
      value: `$${displayStats.totalPurchases.toLocaleString()}`,
      icon: ShoppingCart,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      title: 'Total Returns',
      value: displayStats.totalReturns,
      icon: RotateCcw,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-50',
    },
    {
      title: 'Low Stock Alerts',
      value: displayStats.lowStockProducts,
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ];

  return (
    <>
      <Topbar title="Dashboard" subtitle="Overview of your inventory system" />

      <div className="p-6">
        <BreadCrumb items={[{ label: 'Dashboard' }]} />

        {isDemoMode && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Showing demo dashboard data because demo mode is enabled.
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
              iconBg={card.iconBg}
            />
          ))}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SalesChart
            salesData={displayStats.monthlySalesData}
            purchaseData={displayStats.monthlyPurchaseData}
          />
          <LowStockAlert
            items={isDemoMode ? fallbackLowStockItems : []}
            isLoading={false}
          />
        </div>

        <RecentInvoices
          invoices={isDemoMode ? fallbackRecentInvoices : []}
          isLoading={false}
        />
      </div>
    </>
  );
}
