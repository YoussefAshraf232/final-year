import { describe, expect, it } from "vitest";
import { canAccessRoute, hasPermission, PERMISSIONS } from "../roles";

describe("role permissions", () => {
  it("does not allow employees to access user administration", () => {
    expect(hasPermission("EMPLOYEE", PERMISSIONS.userView)).toBe(false);
    expect(canAccessRoute("EMPLOYEE", "/users")).toBe(false);
  });

  it("allows managers to view reports but not assign roles", () => {
    expect(hasPermission("MANAGER", PERMISSIONS.reportView)).toBe(true);
    expect(hasPermission("MANAGER", PERMISSIONS.roleAssign)).toBe(false);
  });

  it("gives system admins access to users, reports, and audit logs", () => {
    expect(canAccessRoute("ADMIN", "/users")).toBe(true);
    expect(canAccessRoute("ADMIN", "/reports")).toBe(true);
    expect(canAccessRoute("ADMIN", "/dashboard")).toBe(false);
    expect(canAccessRoute("ADMIN", "/audit-logs")).toBe(true);
    expect(canAccessRoute("ADMIN", "/products")).toBe(false);
  });

  it("blocks operational managers from users and sales workflows", () => {
    expect(canAccessRoute("MANAGER", "/dashboard")).toBe(true);
    expect(canAccessRoute("MANAGER", "/invoices/transfers")).toBe(true);
    expect(canAccessRoute("MANAGER", "/users")).toBe(false);
    expect(canAccessRoute("MANAGER", "/customers")).toBe(false);
    expect(canAccessRoute("MANAGER", "/invoices/sales")).toBe(false);
  });

  it("limits warehouse managers to warehouse stock, customers, sales, receiving, and stock edit requests", () => {
    expect(canAccessRoute("EMPLOYEE", "/stock")).toBe(true);
    expect(canAccessRoute("EMPLOYEE", "/customers")).toBe(true);
    expect(canAccessRoute("EMPLOYEE", "/invoices/sales")).toBe(true);
    expect(canAccessRoute("EMPLOYEE", "/invoices/returns")).toBe(true);
    expect(canAccessRoute("EMPLOYEE", "/invoices/purchases")).toBe(true);
    expect(canAccessRoute("EMPLOYEE", "/stock/request-edit")).toBe(true);
    expect(canAccessRoute("EMPLOYEE", "/reports")).toBe(false);
  });
});
