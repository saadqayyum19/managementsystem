import { guardians, students, teachers } from './people'
import { mockUsers } from './auth'
import type { Role } from './types'

export * from './types'
export * from './seed'
export * from './profiles'
export * from './people'
export * from './academics'
export * from './operations'
export * from './finance'
export * from './communication'
export * from './system'
export * from './advanced'
export * from './analytics'
export * from './auth'

export type PersonRef = { id: string; name: string; role: Role; subtitle: string; tone: 'blue' | 'green' | 'orange' | 'purple' }

/** One directory that resolves every ID used across attendance, fees, chat, audit logs and dashboards. */
export const personRefs: PersonRef[] = [
  ...students.map((student) => ({ id: student.id, name: `${student.firstName} ${student.lastName}`, role: 'student' as Role, subtitle: `${student.rollNo} · ${student.classId}`, tone: student.avatarTone })),
  ...teachers.map((teacher) => ({ id: teacher.id, name: `${teacher.firstName} ${teacher.lastName}`, role: 'teacher' as Role, subtitle: teacher.designation, tone: teacher.avatarTone })),
  ...guardians.map((guardian) => ({ id: guardian.id, name: `${guardian.firstName} ${guardian.lastName}`, role: 'parent' as Role, subtitle: guardian.relationship, tone: guardian.avatarTone })),
  ...mockUsers.map((user) => ({ id: user.id, name: `${user.firstName} ${user.lastName}`, role: user.role, subtitle: user.title, tone: 'blue' as const })),
]

export const personIndex: Record<string, PersonRef> = Object.fromEntries(personRefs.map((person) => [person.id, person]))
export const nameOf = (id: string | null): string => (id && personIndex[id]?.name) || 'System'
export const roleOf = (id: string): Role | undefined => personIndex[id]?.role
export const personOf = (id: string | null): PersonRef | undefined => id ? personIndex[id] : undefined
