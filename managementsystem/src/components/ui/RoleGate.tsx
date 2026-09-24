import type { ReactNode } from 'react'
import { useAppSelector } from '../../store'
import type { UserRole } from '../../store/authSlice'

export const roleLabels: Record<UserRole, string> = { super_admin: 'Super Admin', principal: 'Principal', teacher: 'Teacher', student: 'Student', parent: 'Parent' }
export const allRoles: UserRole[] = ['super_admin', 'principal', 'teacher', 'student', 'parent']

export function useRole(): UserRole {
  return useAppSelector((state) => state.auth.user?.role) ?? 'student'
}

export function useCanAccess(roles: UserRole[]): boolean {
  const role = useRole()
  return roles.includes(role)
}

/** Wraps children and renders nothing (or a fallback) when the active role is not allowed. */
export function RoleGate({ roles, children, fallback = null }: { roles: UserRole[]; children: ReactNode; fallback?: ReactNode }) {
  const canAccess = useCanAccess(roles)
  if (!canAccess) return <>{fallback}</>
  return <>{children}</>
}
