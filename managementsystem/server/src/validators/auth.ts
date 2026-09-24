import { z } from 'zod'

const password = z.string().min(8).max(128)
export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email(),
  password,
  role: z.enum(['principal', 'teacher', 'student', 'parent']).default('student'),
  institutionName: z.string().trim().min(2).max(120).optional(),
  institutionCode: z.string().trim().min(2).max(24).optional(),
})
export const loginSchema = z.object({ email: z.string().trim().email(), password, otp: z.string().regex(/^\d{6}$/).optional() })
export const requestOtpSchema = z.object({ email: z.string().trim().email() })
export const forgotPasswordSchema = z.object({ email: z.string().trim().email() })
export const resetPasswordSchema = z.object({ token: z.string().min(20), password })
