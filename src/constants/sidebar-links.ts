import {
  LayoutDashboard, Package, Warehouse, Users,
  ShoppingCart, Truck, FileText, ArrowLeftRight,
  BarChart3, Tags
} from 'lucide-react';

export const sidebarLinks = [
  { label: 'Dashboard',     href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Products',      href: '/products',               icon: Package },
  { label: 'Categories',    href: '/categories',             icon: Tags },
  { label: 'Warehouses',    href: '/warehouses',             icon: Warehouse },
  { label: 'Customers',     href: '/customers',              icon: Users },
  { label: 'Suppliers',     href: '/suppliers',              icon: Truck },
  {
    label: 'Invoices',
    icon: FileText,
    children: [
      { label: 'Sales',              href: '/invoices/sales' },
      { label: 'Purchases',          href: '/invoices/purchases' },
      { label: 'Customer Returns',   href: '/invoices/returns' },
      { label: 'Supplier Returns',   href: '/invoices/purchase-returns' },
      { label: 'Transfers',          href: '/invoices/transfers' },
    ],
  },
  { label: 'Users',         href: '/users',                  icon: Users,      adminOnly: true },
  { label: 'Reports',       href: '/reports',                icon: BarChart3 },
];
