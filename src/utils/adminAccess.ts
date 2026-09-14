import { SystemAdminRole } from "../types";

export const ADMIN_ROLES: SystemAdminRole[] = ["super_admin", "admin", "support"];
export const FULL_ADMIN_ROLES: SystemAdminRole[] = ["super_admin", "admin"];

/**
 * Canonical client-side admin authorization helper.
 * Single source: user.systemRole (server-issued, persisted, returned by /auth/me).
 * Never infer admin from workspace, demo flags, email, or localStorage.
 */
export function getEffectiveAdminRole(role?: SystemAdminRole | null): SystemAdminRole {
  if (!role) return "user";
  return ADMIN_ROLES.includes(role) || role === "user" ? role : "user";
}

export function hasAdminAccess(role?: SystemAdminRole | null): boolean {
  return !!role && ADMIN_ROLES.includes(role);
}

export function hasFullAdminAccess(role?: SystemAdminRole | null): boolean {
  return !!role && FULL_ADMIN_ROLES.includes(role);
}

export function isCustomerRole(role?: SystemAdminRole | null): boolean {
  return !hasAdminAccess(role);
}

/** Admin must never rely on an active customer workspace for authorization. */
export function adminAuthSummary(role?: SystemAdminRole | null): {
  role: SystemAdminRole;
  isAdmin: boolean;
  isFullAdmin: boolean;
  isCustomer: boolean;
} {
  const effective = getEffectiveAdminRole(role);
  const isAdmin = hasAdminAccess(effective);
  return { role: effective, isAdmin, isFullAdmin: hasFullAdminAccess(effective), isCustomer: !isAdmin };
}
