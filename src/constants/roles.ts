import { BadgeVariant } from "@/components/ui/Badge";
import { UserRole } from "@/types/user.types";

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
  manageUsers: ["ADMIN"] as UserRole[],
  manageWarehouses: ["ADMIN", "MANAGER"] as UserRole[],
  createInvoice: ["ADMIN", "MANAGER", "EMPLOYEE"] as UserRole[],
  viewReports: ["ADMIN", "MANAGER"] as UserRole[],
  deleteInvoice: ["ADMIN"] as UserRole[],
};

export function hasPermission(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
