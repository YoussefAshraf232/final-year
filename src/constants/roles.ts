import { BadgeVariant } from "@/components/ui/Badge";
import { UserRole } from "@/types/user.types";

export type Permission =
  | "product.view"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "customer.view"
  | "supplier.view"
  | "warehouse.view"
  | "warehouse.create"
  | "warehouse.update"
  | "warehouse.assignStaff"
  | "stock.view"
  | "stock.adjust"
  | "stock.transfer"
  | "stock.count"
  | "sales.view"
  | "sales.create"
  | "sales.update"
  | "sales.cancel"
  | "purchase.view"
  | "purchase.create"
  | "purchase.update"
  | "purchase.cancel"
  | "returns.create"
  | "returns.approve"
  | "user.view"
  | "user.create"
  | "user.update"
  | "user.deactivate"
  | "role.assign"
  | "report.view"
  | "report.export"
  | "audit.view";

export const ROLES: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

export const ROLE_OPTIONS = Object.entries(ROLES).map(([value, label]) => ({
  value,
  label,
}));

export const ROLE_COLORS: Record<UserRole, BadgeVariant> = {
  ADMIN: "danger",
  MANAGER: "warning",
  EMPLOYEE: "info",
};

export const PERMISSIONS = {
  productView: "product.view",
  productCreate: "product.create",
  productUpdate: "product.update",
  productDelete: "product.delete",
  customerView: "customer.view",
  supplierView: "supplier.view",
  warehouseView: "warehouse.view",
  warehouseCreate: "warehouse.create",
  warehouseUpdate: "warehouse.update",
  warehouseAssignStaff: "warehouse.assignStaff",
  stockView: "stock.view",
  stockAdjust: "stock.adjust",
  stockTransfer: "stock.transfer",
  stockCount: "stock.count",
  salesView: "sales.view",
  salesCreate: "sales.create",
  salesUpdate: "sales.update",
  salesCancel: "sales.cancel",
  purchaseView: "purchase.view",
  purchaseCreate: "purchase.create",
  purchaseUpdate: "purchase.update",
  purchaseCancel: "purchase.cancel",
  returnsCreate: "returns.create",
  returnsApprove: "returns.approve",
  userView: "user.view",
  userCreate: "user.create",
  userUpdate: "user.update",
  userDeactivate: "user.deactivate",
  roleAssign: "role.assign",
  reportView: "report.view",
  reportExport: "report.export",
  auditView: "audit.view",
} as const satisfies Record<string, Permission>;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: Object.values(PERMISSIONS),
  MANAGER: [
    PERMISSIONS.productView,
    PERMISSIONS.productCreate,
    PERMISSIONS.productUpdate,
    PERMISSIONS.customerView,
    PERMISSIONS.supplierView,
    PERMISSIONS.warehouseView,
    PERMISSIONS.warehouseCreate,
    PERMISSIONS.warehouseUpdate,
    PERMISSIONS.stockView,
    PERMISSIONS.stockAdjust,
    PERMISSIONS.stockTransfer,
    PERMISSIONS.stockCount,
    PERMISSIONS.salesView,
    PERMISSIONS.salesCreate,
    PERMISSIONS.salesUpdate,
    PERMISSIONS.purchaseView,
    PERMISSIONS.purchaseCreate,
    PERMISSIONS.purchaseUpdate,
    PERMISSIONS.returnsCreate,
    PERMISSIONS.returnsApprove,
    PERMISSIONS.reportView,
    PERMISSIONS.reportExport,
  ],
  EMPLOYEE: [
    PERMISSIONS.productView,
    PERMISSIONS.customerView,
    PERMISSIONS.supplierView,
    PERMISSIONS.warehouseView,
    PERMISSIONS.stockView,
    PERMISSIONS.stockTransfer,
    PERMISSIONS.salesView,
    PERMISSIONS.salesCreate,
    PERMISSIONS.purchaseView,
    PERMISSIONS.returnsCreate,
  ],
};

export function hasPermission(
  userRole: UserRole | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false;
  return ROLE_PERMISSIONS[userRole].includes(permission);
}

export function hasAnyRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function canAccessRoute(userRole: UserRole | undefined, route: string): boolean {
  if (route.startsWith("/users")) return hasPermission(userRole, PERMISSIONS.userView);
  if (route.startsWith("/audit-logs")) return hasPermission(userRole, PERMISSIONS.auditView);
  if (route.startsWith("/reports")) return hasPermission(userRole, PERMISSIONS.reportView);
  if (route.startsWith("/stock")) return hasPermission(userRole, PERMISSIONS.stockView);
  if (route.startsWith("/warehouses")) return hasPermission(userRole, PERMISSIONS.warehouseView);
  if (route.startsWith("/products") || route.startsWith("/categories")) {
    return hasPermission(userRole, PERMISSIONS.productView);
  }
  if (route.startsWith("/customers")) return hasPermission(userRole, PERMISSIONS.customerView);
  if (route.startsWith("/suppliers")) return hasPermission(userRole, PERMISSIONS.supplierView);
  if (route.startsWith("/invoices/purchases")) return hasPermission(userRole, PERMISSIONS.purchaseView);
  if (route.startsWith("/invoices")) return hasPermission(userRole, PERMISSIONS.salesView);
  return true;
}
