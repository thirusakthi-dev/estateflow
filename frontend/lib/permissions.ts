import type { AuthUser } from "@/features/auth/auth.type";

export function isAdmin(role: AuthUser["role"] | null | undefined): boolean {
  return role === "ADMIN";
}

export function isSalesEmployee(
  role: AuthUser["role"] | null | undefined,
): boolean {
  return role === "SALES_EMPLOYEE";
}
