import type { Role } from './types'

export type MockUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
  institutionId: string
  phone: string
  title: string
  linkedPersonId: string | null
}

/** Demo sign-in accounts — one per role. No backend is contacted during this phase. */
export const mockUsers: MockUser[] = [
  { id: 'usr-superadmin', firstName: 'Nadia', lastName: 'Osei', email: 'superadmin@educore.app', password: 'Password123!', role: 'super_admin', institutionId: 'wba-2024', phone: '+1 415 555 0101', title: 'Institution administrator', linkedPersonId: null },
  { id: 'usr-principal', firstName: 'Aisha', lastName: 'Rahman', email: 'principal@educore.app', password: 'Password123!', role: 'principal', institutionId: 'wba-2024', phone: '+1 415 555 0102', title: 'Principal', linkedPersonId: 'tch-01' },
  { id: 'usr-teacher', firstName: 'Marcus', lastName: 'Lee', email: 'teacher@educore.app', password: 'Password123!', role: 'teacher', institutionId: 'wba-2024', phone: '+1 415 555 0122', title: 'Senior Teacher · Science', linkedPersonId: 'tch-02' },
  { id: 'usr-student', firstName: 'Olivia', lastName: 'Chen', email: 'student@educore.app', password: 'Password123!', role: 'student', institutionId: 'wba-2024', phone: '+1 415 555 0134', title: 'Grade 10A · Roll 10A-01', linkedPersonId: 'stu-01' },
  { id: 'usr-parent', firstName: 'Daniel', lastName: 'Chen', email: 'parent@educore.app', password: 'Password123!', role: 'parent', institutionId: 'wba-2024', phone: '+1 415 555 0130', title: 'Guardian of Olivia Chen', linkedPersonId: 'gdn-01' },
]

export const demoCredentials = mockUsers.map((user) => ({ role: user.role, email: user.email, password: user.password }))

export function authenticate(email: string, password: string): MockUser | null {
  const normalised = email.trim().toLowerCase()
  return mockUsers.find((user) => user.email.toLowerCase() === normalised && user.password === password) ?? null
}

export const findMockUser = (id: string) => mockUsers.find((user) => user.id === id)
