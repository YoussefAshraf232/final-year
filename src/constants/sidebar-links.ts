import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  Truck,
  FileText,
  BarChart3,
  Tags,
  Boxes,
  ScrollText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PERMISSIONS, Permission } from './roles';
import { ROUTES } from './routes';

export interface SidebarLink {
  label: string;
  href?: string;
  icon?: LucideIcon;
  permission?: Permission;
  children?: SidebarLink[];
}

export const sidebarLinks: SidebarLink[] = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard, permission: PERMISSIONS.dashboardView },
  { label: 'Products', href: ROUTES.PRODUCTS, icon: Package, permission: PERMISSIONS.productView },
  { label: 'Categories', href: ROUTES.CATEGORIES, icon: Tags, permission: PERMISSIONS.categoryView },
  { label: 'Suppliers', href: ROUTES.SUPPLIERS, icon: Truck, permission: PERMISSIONS.supplierView },
  {
    label: 'Stock',
    icon: Boxes,
    permission: PERMISSIONS.stockView,
    children: [
      { label: 'Stock On Hand', href: ROUTES.STOCK, permission: PERMISSIONS.stockView },
      { label: 'Movements', href: ROUTES.STOCK_MOVEMENTS, permission: PERMISSIONS.stockMovementView },
    ],
  },
  {
    label: 'Warehouse Stock',
    href: ROUTES.STOCK,
    icon: Boxes,
    permission: PERMISSIONS.warehouseStockView,
  },
  { label: 'Warehouses', href: ROUTES.WAREHOUSES, icon: Warehouse, permission: PERMISSIONS.warehouseView },
  { label: 'Customers', href: ROUTES.CUSTOMERS, icon: Users, permission: PERMISSIONS.customerView },
  {
    label: 'Sales',
    icon: FileText,
    children: [
      {
        label: 'Manage Sales',
        href: ROUTES.SALES_INVOICES,
        permission: PERMISSIONS.salesInvoiceView,
        children: [
          { label: 'Sales Invoices', href: ROUTES.SALES_INVOICES, permission: PERMISSIONS.salesInvoiceView },
          { label: 'Sales Returns', href: ROUTES.RETURN_INVOICES, permission: PERMISSIONS.salesReturnView },
        ],
      },
    ],
  },
  { label: 'Receive Orders', href: ROUTES.PURCHASE_INVOICES, icon: Truck, permission: PERMISSIONS.receiveOrderView },
  { label: 'Distribute Products', href: ROUTES.INTERNAL_INVOICES, icon: FileText, permission: PERMISSIONS.transferView },
  { label: 'Request Stock Edit', href: ROUTES.STOCK_REQUEST_EDIT, icon: ScrollText, permission: PERMISSIONS.stockEditRequest },
  { label: 'Users', href: ROUTES.USERS, icon: Users, permission: PERMISSIONS.userView },
  { label: 'Reports', href: ROUTES.REPORTS, icon: BarChart3, permission: PERMISSIONS.reportView },
  { label: 'Audit Logs', href: ROUTES.AUDIT_LOGS, icon: ScrollText, permission: PERMISSIONS.auditView },
];
