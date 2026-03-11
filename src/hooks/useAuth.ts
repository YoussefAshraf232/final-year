"use client";

import { useAuth as useAuthContext } from "@/context/AuthContext";
import { hasPermission, PERMISSIONS } from "@/constants/roles";
import { UserRole } from "@/types/user.types";

// This hook wraps AuthContext and adds permission helpers
export function useAuth() {
  const auth = useAuthContext();

  // Permission checks
  const canManageUsers = hasPermission(
    auth.user?.role,
    PERMISSIONS.manageUsers
  );

  const canManageWarehouses = hasPermission(
    auth.user?.role,
    PERMISSIONS.manageWarehouses
  );

  const canCreateInvoice = hasPermission(
    auth.user?.role,
    PERMISSIONS.createInvoice
  );

  const canViewReports = hasPermission(
    auth.user?.role,
    PERMISSIONS.viewReports
  );

  const canDeleteInvoice = hasPermission(
    auth.user?.role,
    PERMISSIONS.deleteInvoice
  );

  // Generic role check
  const hasRole = (roles: UserRole[]) =>
    hasPermission(auth.user?.role, roles);

  const isAdmin = auth.user?.role === "ADMIN";
  const isManager = auth.user?.role === "MANAGER";
  const isEmployee = auth.user?.role === "EMPLOYEE";

  return {
    ...auth,
    // Permission flags
    canManageUsers,
    canManageWarehouses,
    canCreateInvoice,
    canViewReports,
    canDeleteInvoice,
    // Role checks
    hasRole,
    isAdmin,
    isManager,
    isEmployee,
  };
}