"use client";

import { useAuth as useAuthContext } from "@/context/AuthContext";
import { GUEST_TOKEN } from "@/constants/auth";
import {
  BACKEND_TO_FRONTEND_ROLE,
  canAccessRoute,
  hasAnyRole,
  hasPermission,
  Permission,
  PERMISSIONS,
} from "@/constants/roles";
import { UserRole } from "@/types/user.types";

// This hook wraps AuthContext and adds permission helpers
export function useAuth() {
  const auth = useAuthContext();

  // Permission checks
  const canManageUsers = hasPermission(auth.user?.role, PERMISSIONS.userView);
  const canManageWarehouses = hasPermission(
    auth.user?.role,
    PERMISSIONS.warehouseManage
  );
  const canCreateInvoice = hasPermission(auth.user?.role, PERMISSIONS.salesCreate);
  const canViewReports = hasPermission(auth.user?.role, PERMISSIONS.reportView);
  const canDeleteInvoice = hasPermission(auth.user?.role, PERMISSIONS.salesCancel);

  // Generic role check
  const hasRole = (roles: UserRole[]) => hasAnyRole(auth.user?.role, roles);

  const can = (permission: Permission) =>
    hasPermission(auth.user?.role, permission);

  const canAccess = (route: string) => canAccessRoute(auth.user?.role, route);

  const isGuest = auth.token === GUEST_TOKEN;
  const frontendRole = auth.user?.role
    ? BACKEND_TO_FRONTEND_ROLE[auth.user.role]
    : undefined;
  const isSystemAdmin = frontendRole === "SYSTEM_ADMIN";
  const isOperationalManager = frontendRole === "OPERATIONAL_MANAGER";
  const isWarehouseManager = frontendRole === "WAREHOUSE_MANAGER";

  return {
    ...auth,
    // Permission flags
    canManageUsers,
    canManageWarehouses,
    canCreateInvoice,
    canViewReports,
    canDeleteInvoice,
    can,
    canAccess,
    // Role checks
    hasRole,
    isAdmin: isSystemAdmin,
    isManager: isOperationalManager,
    isEmployee: isWarehouseManager,
    isSystemAdmin,
    isOperationalManager,
    isWarehouseManager,
    isGuest,
    frontendRole,
  };
}
