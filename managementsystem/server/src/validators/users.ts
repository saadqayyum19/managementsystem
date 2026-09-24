import { z } from 'zod'

const userRole = z.enum(['super_admin', 'principal', 'teacher', 'student', 'parent'])
const password = z.string().min(8).max(128)

export const createUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional(),
  password,
  role: userRole,
  permissions: z.array(z.string().trim().min(1)).max(50).default([]),
  avatarUrl: z.string().url().optional(),
})

export const updateUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(30).optional(),
  password: password.optional(),
  role: userRole.optional(),
  permissions: z.array(z.string().trim().min(1)).max(50).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
})
