import { UserRole } from "@/types/user.types";

// Role display names
export const ROLES: Record<UserRole, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
};

// For dropdown selects
export const ROLE_OPTIONS = Object.entries(ROLES).map(([value, label]) => ({
  value,
  label,
}));

// Role badge colors (maps to Badge component variants)
export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "danger",
  MANAGER: "warning",
  EMPLOYEE: "info",
};

// Role permissions (which roles can access what)
export const PERMISSIONS = {
  manageUsers: ["ADMIN"] as UserRole[],
  manageWarehouses: ["ADMIN", "MANAGER"] as UserRole[],
  createInvoice: ["ADMIN", "MANAGER", "EMPLOYEE"] as UserRole[],
  viewReports: ["ADMIN", "MANAGER"] as UserRole[],
  deleteInvoice: ["ADMIN"] as UserRole[],
};

// Helper: Check if a role has a permission
export function hasPermission(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
