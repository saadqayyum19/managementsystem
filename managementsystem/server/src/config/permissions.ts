import type { Role } from '../models/Role.js'

export const Permission = {
  INSTITUTION_READ: 'institution:read',
  INSTITUTION_WRITE: 'institution:write',
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  ACADEMICS_READ: 'academics:read',
  ACADEMICS_WRITE: 'academics:write',
  ATTENDANCE_READ: 'attendance:read',
  ATTENDANCE_WRITE: 'attendance:write',
  EXAMS_READ: 'exams:read',
  EXAMS_WRITE: 'exams:write',
  ASSIGNMENTS_READ: 'assignments:read',
  ASSIGNMENTS_WRITE: 'assignments:write',
  FINANCE_READ: 'finance:read',
  FINANCE_WRITE: 'finance:write',
  COMMUNICATION_READ: 'communication:read',
  COMMUNICATION_WRITE: 'communication:write',
  OPERATIONS_READ: 'operations:read',
  OPERATIONS_WRITE: 'operations:write',
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',
  SYSTEM_READ: 'system:read',
  SYSTEM_WRITE: 'system:write',
  AUDIT_READ: 'audit:read',
} as const

export type Permission = typeof Permission[keyof typeof Permission]
export const permissionValues = Object.values(Permission) as [Permission, ...Permission[]]
export const ALL_PERMISSIONS = '*' as const

export const rolePermissions: Record<Role, readonly (Permission | typeof ALL_PERMISSIONS)[]> = {
  super_admin: [ALL_PERMISSIONS],
  principal: [
    Permission.INSTITUTION_READ,
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.ACADEMICS_READ,
    Permission.ACADEMICS_WRITE,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_WRITE,
    Permission.EXAMS_READ,
    Permission.EXAMS_WRITE,
    Permission.ASSIGNMENTS_READ,
    Permission.ASSIGNMENTS_WRITE,
    Permission.FINANCE_READ,
    Permission.FINANCE_WRITE,
    Permission.COMMUNICATION_READ,
    Permission.COMMUNICATION_WRITE,
    Permission.OPERATIONS_READ,
    Permission.OPERATIONS_WRITE,
    Permission.REPORTS_READ,
    Permission.REPORTS_EXPORT,
  ],
  teacher: [
    Permission.USER_READ,
    Permission.ACADEMICS_READ,
    Permission.ATTENDANCE_READ,
    Permission.ATTENDANCE_WRITE,
    Permission.EXAMS_READ,
    Permission.EXAMS_WRITE,
    Permission.ASSIGNMENTS_READ,
    Permission.ASSIGNMENTS_WRITE,
    Permission.COMMUNICATION_READ,
    Permission.COMMUNICATION_WRITE,
    Permission.OPERATIONS_READ,
    Permission.REPORTS_READ,
  ],
  student: [
    Permission.INSTITUTION_READ,
    Permission.ACADEMICS_READ,
    Permission.ATTENDANCE_READ,
    Permission.EXAMS_READ,
    Permission.ASSIGNMENTS_READ,
    Permission.COMMUNICATION_READ,
    Permission.OPERATIONS_READ,
  ],
  parent: [
    Permission.INSTITUTION_READ,
    Permission.ACADEMICS_READ,
    Permission.ATTENDANCE_READ,
    Permission.EXAMS_READ,
    Permission.FINANCE_READ,
    Permission.COMMUNICATION_READ,
    Permission.OPERATIONS_READ,
  ],
}

export function roleHasPermission(role: Role, permission: Permission, explicitPermissions: readonly string[] = []): boolean {
  const granted = rolePermissions[role]
  return granted.includes(ALL_PERMISSIONS) || granted.includes(permission) || explicitPermissions.includes(permission)
}
