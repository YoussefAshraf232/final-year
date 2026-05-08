import {
  LayoutDashboard, Package, Warehouse, Users,
  Truck, FileText,
  BarChart3, Tags, Boxes, ScrollText
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PERMISSIONS, Permission } from './roles';

export interface SidebarLink {
  label: string;
  href?: string;
  icon?: LucideIcon;
  permission?: Permission;
  adminOnly?: boolean;
  children?: { label: string; href: string; permission?: Permission }[];
}

export const sidebarLinks: SidebarLink[] = [
  { label: 'Dashboard',     href: '/dashboard',              icon: LayoutDashboard },
  { label: 'Products',      href: '/products',               icon: Package, permission: PERMISSIONS.productView },
  { label: 'Categories',    href: '/categories',             icon: Tags, permission: PERMISSIONS.productView },
  { label: 'Warehouses',    href: '/warehouses',             icon: Warehouse, permission: PERMISSIONS.warehouseView },
  {
    label: 'Stock',
    icon: Boxes,
    permission: PERMISSIONS.stockView,
    children: [
      { label: 'Stock On Hand', href: '/stock', permission: PERMISSIONS.stockView },
      { label: 'Movements', href: '/stock/movements', permission: PERMISSIONS.stockView },
    ],
  },
  { label: 'Customers',     href: '/customers',              icon: Users, permission: PERMISSIONS.customerView },
  { label: 'Suppliers',     href: '/suppliers',              icon: Truck, permission: PERMISSIONS.supplierView },
  {
    label: 'Invoices',
    icon: FileText,
    children: [
      { label: 'Sales',              href: '/invoices/sales', permission: PERMISSIONS.salesView },
      { label: 'Purchases',          href: '/invoices/purchases', permission: PERMISSIONS.purchaseView },
      { label: 'Customer Returns',   href: '/invoices/returns', permission: PERMISSIONS.returnsCreate },
      { label: 'Supplier Returns',   href: '/invoices/purchase-returns', permission: PERMISSIONS.returnsCreate },
      { label: 'Transfers',          href: '/invoices/transfers', permission: PERMISSIONS.stockTransfer },
    ],
  },
  { label: 'Users',         href: '/users',                  icon: Users,      permission: PERMISSIONS.userView, adminOnly: true },
  { label: 'Reports',       href: '/reports',                icon: BarChart3, permission: PERMISSIONS.reportView },
  { label: 'Audit Logs',    href: '/audit-logs',             icon: ScrollText, permission: PERMISSIONS.auditView, adminOnly: true },
];
