import { z } from 'zod'
import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../utils/errors.js'

export const academicResources = ['classes', 'sections', 'subjects', 'departments', 'programs', 'semesters'] as const
export type AcademicResource = typeof academicResources[number]
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id')
const base = { isActive: z.boolean().optional() }

export const academicSchemas: Record<AcademicResource, z.ZodType> = {
  classes: z.object({ name: z.string().trim().min(1).max(100), code: z.string().trim().min(1).max(30), gradeLevel: z.number().int().min(1).max(20), departmentId: objectId.optional(), academicYear: z.string().trim().min(4).max(20), ...base }),
  sections: z.object({ classId: objectId, name: z.string().trim().min(1).max(80), code: z.string().trim().min(1).max(20), capacity: z.number().int().min(1).max(500).optional(), room: z.string().trim().max(80).optional(), classTeacherId: objectId.optional(), ...base }),
  subjects: z.object({ name: z.string().trim().min(1).max(120), code: z.string().trim().min(1).max(30), departmentId: objectId.optional(), credits: z.number().min(0).max(50).optional(), type: z.enum(['core', 'elective', 'activity']).optional(), ...base }),
  departments: z.object({ name: z.string().trim().min(1).max(120), code: z.string().trim().min(1).max(30), description: z.string().trim().max(500).optional(), headTeacherId: objectId.optional(), ...base }),
  programs: z.object({ name: z.string().trim().min(1).max(150), code: z.string().trim().min(1).max(30), level: z.enum(['school', 'undergraduate', 'postgraduate']), departmentId: objectId.optional(), durationYears: z.number().min(0.5).max(10).optional(), ...base }),
  semesters: z.object({ name: z.string().trim().min(1).max(80), number: z.number().int().min(1).max(20), academicYear: z.string().trim().min(4).max(20), startDate: z.coerce.date(), endDate: z.coerce.date(), isCurrent: z.boolean().optional(), ...base }),
}

export function validateAcademicBody(req: Request, _res: Response, next: NextFunction) {
  const resource = req.params.resource as AcademicResource
  const schema = academicSchemas[resource]
  if (!schema) return next(new AppError('Academic resource not found', 404, 'RESOURCE_NOT_FOUND'))
  const validationSchema = req.method === 'PATCH' ? (schema as z.ZodObject<any>).partial() : schema
  const result = validationSchema.safeParse(req.body)
  if (!result.success) return next(new AppError(result.error.issues.map((issue: { message: string }) => issue.message).join(', '), 400, 'VALIDATION_ERROR'))
  req.body = result.data
  next()
}
