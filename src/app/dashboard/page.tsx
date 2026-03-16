'use client';

import { useDashboardStats } from '@/hooks/useDashboard';
import StatCard from '@/components/dashboard/StatCard';
import SalesChart from '@/components/dashboard/SalesChart';
import LowStockAlert from '@/components/dashboard/LowStockAlert';
import RecentInvoices from '@/components/dashboard/RecentInvoices';
import Topbar from '@/components/layout/Topbar';
import BreadCrumb from '@/components/layout/BreadCrumb';
import { Package, Users, Truck, Warehouse, DollarSign, ShoppingCart, RotateCcw, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  const breadcrumbItems = [
    { label: 'Dashboard' },
  ];

  // Fallback data for when API is not available
  const fallbackStats = {
    totalProducts: 1250,
    totalCustomers: 89,
    totalSuppliers: 34,
    totalWarehouses: 5,
    totalSales: 45678.90,
    totalPurchases: 23456.78,
    totalReturns: 12,
    lowStockProducts: 8,
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

  const displayStats = stats || fallbackStats;

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

  // Mock data for components
  const mockLowStockItems = [
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

  const mockRecentInvoices = [
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
      totalPrice: 1500.00,
      createdAt: '2024-01-14T14:20:00Z',
    },
    {
      id: 3,
      type: 'sale' as const,
      customerOrSupplier: 'Jane Smith',
      totalPrice: 89.50,
      createdAt: '2024-01-13T09:15:00Z',
    },
  ];

  if (error) {
    console.warn('Dashboard API error:', error);
  }

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Overview of your inventory system"
      />

      <div className="p-6">
        <BreadCrumb items={breadcrumbItems} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              value={card.value}
              icon={card.icon}
              iconColor={card.iconColor}
              iconBg={card.iconBg}
            />
          ))}
        </div>

        {/* Charts and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SalesChart
            salesData={displayStats.monthlySalesData}
            purchaseData={displayStats.monthlyPurchaseData}
          />
          <LowStockAlert
            items={mockLowStockItems}
            isLoading={false}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <RecentInvoices
            invoices={mockRecentInvoices}
            isLoading={false}
          />
        </div>
      </div>
    </>
  );
}