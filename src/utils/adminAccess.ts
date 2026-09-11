import { SystemAdminRole } from "../types";

export const ADMIN_ROLES: SystemAdminRole[] = ["super_admin", "admin", "support"];
export const FULL_ADMIN_ROLES: SystemAdminRole[] = ["super_admin", "admin"];

export function hasAdminAccess(role?: SystemAdminRole | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export function hasFullAdminAccess(role?: SystemAdminRole | null): boolean {
  return !!role && FULL_ADMIN_ROLES.includes(role);
}