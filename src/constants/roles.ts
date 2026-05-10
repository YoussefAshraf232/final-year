import { BadgeVariant } from "@/components/ui/Badge";
import { UserRole } from "@/types/user.types";
import { ROUTES } from "./routes";

export type Permission =
  | "dashboard.view"
  | "user.view"
  | "user.manage"
  | "product.view"
  | "product.manage"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "category.view"
  | "supplier.view"
  | "supplier.manage"
  | "warehouse.view"
  | "warehouse.manage"
  | "warehouse.create"
  | "warehouse.update"
  | "warehouse.assignStaff"
  | "stock.view"
  | "warehouse-stock.view"
  | "stock.movement.view"
  | "stock-edit-request.create"
  | "stock.adjust"
  | "stock.transfer"
  | "stock.count"
  | "transfer.view"
  | "transfer.manage"
  | "sales.view"
  | "sales.manage"
  | "sales-invoice.view"
  | "sales-invoice.create"
  | "sales.create"
  | "sales.update"
  | "sales.cancel"
  | "sales-return.view"
  | "sales.return.manage"
  | "receive-order.view"
  | "receive-order.manage"
  | "purchase.view"
  | "purchase.manage"
  | "purchase.create"
  | "purchase.update"
  | "purchase.cancel"
  | "customer.view"
  | "customer.manage"
  | "returns.create"
  | "returns.approve"
  | "user.create"
  | "user.update"
  | "user.deactivate"
  | "role.assign"
  | "report.view"
  | "financial-report.view"
  | "report.export"
  | "audit.view"
  | "low-stock-alert.view";

// Map backend user roles returned by the API to explicit frontend role names
export const FRONTEND_ROLES = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  OPERATIONAL_MANAGER: "OPERATIONAL_MANAGER",
  WAREHOUSE_MANAGER: "WAREHOUSE_MANAGER",
} as const;

export type FrontendRole = typeof FRONTEND_ROLES[keyof typeof FRONTEND_ROLES];

export const BACKEND_TO_FRONTEND_ROLE: Record<UserRole, FrontendRole> = {
  SYSTEM_ADMIN: FRONTEND_ROLES.SYSTEM_ADMIN,
  OPERATIONAL_MANAGER: FRONTEND_ROLES.OPERATIONAL_MANAGER,
  WAREHOUSE_MANAGER: FRONTEND_ROLES.WAREHOUSE_MANAGER,
  ADMIN: FRONTEND_ROLES.SYSTEM_ADMIN,
  MANAGER: FRONTEND_ROLES.OPERATIONAL_MANAGER,
  EMPLOYEE: FRONTEND_ROLES.WAREHOUSE_MANAGER,
};

export function getFrontendRole(userRole: UserRole | undefined): FrontendRole | undefined {
  if (!userRole) return undefined;
  return BACKEND_TO_FRONTEND_ROLE[userRole];
}

export function getLandingRoute(userRole: UserRole | undefined): string {
  switch (userRole) {
    case "ADMIN":
    case "SYSTEM_ADMIN":
      return ROUTES.USERS;
    case "MANAGER":
    case "OPERATIONAL_MANAGER":
      return ROUTES.DASHBOARD;
    case "EMPLOYEE":
    case "WAREHOUSE_MANAGER":
      return ROUTES.STOCK;
    default:
      return ROUTES.LOGIN;
  }
}

export const ROLES: Record<UserRole, string> = {
  ADMIN: "System Admin",
  MANAGER: "Operational Manager",
  EMPLOYEE: "Warehouse Manager",
  SYSTEM_ADMIN: "System Admin",
  OPERATIONAL_MANAGER: "Operational Manager",
  WAREHOUSE_MANAGER: "Warehouse Manager",
};

export const ROLE_OPTIONS = Object.entries(ROLES).map(([value, label]) => ({
  value,
  label,
}));

export const ROLE_COLORS: Record<UserRole, BadgeVariant> = {
  ADMIN: "danger",
  MANAGER: "warning",
  EMPLOYEE: "info",
  SYSTEM_ADMIN: "danger",
  OPERATIONAL_MANAGER: "warning",
  WAREHOUSE_MANAGER: "info",
};

export const PERMISSIONS = {
  dashboardView: "dashboard.view",
  userView: "user.view",
  userManage: "user.manage",
  userCreate: "user.create",
  userUpdate: "user.update",
  userDeactivate: "user.deactivate",
  roleAssign: "role.assign",
  productView: "product.view",
  productManage: "product.manage",
  productCreate: "product.create",
  productUpdate: "product.update",
  productDelete: "product.delete",
  categoryView: "category.view",
  supplierView: "supplier.view",
  supplierManage: "supplier.manage",
  warehouseView: "warehouse.view",
  warehouseManage: "warehouse.manage",
  warehouseCreate: "warehouse.create",
  warehouseUpdate: "warehouse.update",
  warehouseAssignStaff: "warehouse.assignStaff",
  stockView: "stock.view",
  warehouseStockView: "warehouse-stock.view",
  stockMovementView: "stock.movement.view",
  stockEditRequest: "stock-edit-request.create",
  stockAdjust: "stock.adjust",
  stockTransfer: "stock.transfer",
  stockCount: "stock.count",
  transferView: "transfer.view",
  transferManage: "transfer.manage",
  salesView: "sales.view",
  salesManage: "sales.manage",
  salesInvoiceView: "sales-invoice.view",
  salesInvoiceCreate: "sales-invoice.create",
  salesCreate: "sales.create",
  salesUpdate: "sales.update",
  salesCancel: "sales.cancel",
  salesReturnView: "sales-return.view",
  salesReturnManage: "sales.return.manage",
  receiveOrderView: "receive-order.view",
  receiveOrderManage: "receive-order.manage",
  purchaseView: "purchase.view",
  purchaseManage: "purchase.manage",
  purchaseCreate: "purchase.create",
  purchaseUpdate: "purchase.update",
  purchaseCancel: "purchase.cancel",
  customerView: "customer.view",
  customerManage: "customer.manage",
  returnsCreate: "returns.create",
  returnsApprove: "returns.approve",
  reportView: "report.view",
  financialReportView: "financial-report.view",
  reportExport: "report.export",
  auditView: "audit.view",
  lowStockAlertView: "low-stock-alert.view",
} as const satisfies Record<string, Permission>;

// Permission matrix for each major user role
export const ROLE_PERMISSIONS: Record<FrontendRole, Permission[]> = {
  SYSTEM_ADMIN: [
    PERMISSIONS.userView,
    PERMISSIONS.userManage,
    PERMISSIONS.userCreate,
    PERMISSIONS.userUpdate,
    PERMISSIONS.userDeactivate,
    PERMISSIONS.reportView,
    PERMISSIONS.financialReportView,
    PERMISSIONS.reportExport,
  ],
  OPERATIONAL_MANAGER: [
    PERMISSIONS.dashboardView,
    PERMISSIONS.productView,
    PERMISSIONS.productManage,
    PERMISSIONS.supplierView,
    PERMISSIONS.supplierManage,
    PERMISSIONS.warehouseView,
    PERMISSIONS.warehouseManage,
    PERMISSIONS.stockView,
    PERMISSIONS.stockMovementView,
    PERMISSIONS.transferView,
    PERMISSIONS.transferManage,
    PERMISSIONS.reportView,
    PERMISSIONS.financialReportView,
    PERMISSIONS.reportExport,
    PERMISSIONS.auditView,
    PERMISSIONS.lowStockAlertView,
  ],
  WAREHOUSE_MANAGER: [
    PERMISSIONS.dashboardView,
    PERMISSIONS.customerView,
    PERMISSIONS.customerManage,
    PERMISSIONS.warehouseStockView,
    PERMISSIONS.stockEditRequest,
    PERMISSIONS.salesView,
    PERMISSIONS.salesManage,
    PERMISSIONS.salesInvoiceView,
    PERMISSIONS.salesInvoiceCreate,
    PERMISSIONS.salesReturnView,
    PERMISSIONS.salesReturnManage,
    PERMISSIONS.receiveOrderView,
    PERMISSIONS.receiveOrderManage,
  ],
};

export function hasPermission(
  userRole: UserRole | undefined,
  permission: Permission
): boolean {
  if (!userRole) return false;
  const frontendRole = getFrontendRole(userRole);
  return frontendRole ? ROLE_PERMISSIONS[frontendRole].includes(permission) : false;
}

export function hasAnyRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  const frontendRole = getFrontendRole(userRole);
  return allowedRoles.some((role) => role === userRole || getFrontendRole(role) === frontendRole);
}

export function canAccessRoute(userRole: UserRole | undefined, route: string): boolean {
  if (route.startsWith(ROUTES.LOGIN)) return true;
  if (route.startsWith(ROUTES.PROFILE)) return true;
  if (route.startsWith(ROUTES.USERS)) return hasPermission(userRole, PERMISSIONS.userView);
  if (route.startsWith(ROUTES.AUDIT_LOGS)) return hasPermission(userRole, PERMISSIONS.auditView);
  if (route.startsWith(ROUTES.REPORTS)) return hasPermission(userRole, PERMISSIONS.reportView);
  if (route.startsWith(`${ROUTES.STOCK}/request-edit`)) return hasPermission(userRole, PERMISSIONS.stockEditRequest);
  if (route.startsWith(ROUTES.STOCK_MOVEMENTS)) return hasPermission(userRole, PERMISSIONS.stockMovementView);
  if (route.startsWith(ROUTES.STOCK)) {
    return (
      hasPermission(userRole, PERMISSIONS.stockView) ||
      hasPermission(userRole, PERMISSIONS.warehouseStockView)
    );
  }
  if (route.startsWith(ROUTES.WAREHOUSES)) return hasPermission(userRole, PERMISSIONS.warehouseView);
  if (route.startsWith(ROUTES.CATEGORIES)) return hasPermission(userRole, PERMISSIONS.categoryView);
  if (route.startsWith(ROUTES.PRODUCTS)) return hasPermission(userRole, PERMISSIONS.productView);
  if (route.startsWith(ROUTES.CUSTOMERS)) return hasPermission(userRole, PERMISSIONS.customerView);
  if (route.startsWith(ROUTES.SUPPLIERS)) return hasPermission(userRole, PERMISSIONS.supplierView);
  if (route.startsWith(ROUTES.INTERNAL_INVOICES)) return hasPermission(userRole, PERMISSIONS.transferView);
  if (route.startsWith(ROUTES.SALES_INVOICES)) return hasPermission(userRole, PERMISSIONS.salesInvoiceView);
  if (route.startsWith(ROUTES.RETURN_INVOICES)) return hasPermission(userRole, PERMISSIONS.salesReturnView);
  if (route.startsWith(ROUTES.PURCHASE_INVOICES)) return hasPermission(userRole, PERMISSIONS.receiveOrderView);
  if (route.startsWith(ROUTES.RETURN_PURCHASE_INVOICES)) return false;
  if (route.startsWith(ROUTES.DASHBOARD)) return hasPermission(userRole, PERMISSIONS.dashboardView);
  return false;
}
