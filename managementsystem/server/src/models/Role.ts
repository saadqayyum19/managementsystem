export const Role = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
} as const

export const roleValues = Object.values(Role) as [string, ...string[]]
export type Role = typeof Role[keyof typeof Role]
