import { z } from 'zod'
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id')
const subject = z.object({ subjectId: objectId, maxMarks: z.number().positive(), passMarks: z.number().min(0) })
export const examSchema = z.object({ name: z.string().trim().min(1).max(150), examType: z.enum(['unit', 'midterm', 'final', 'entrance', 'quiz']), academicYear: z.string().trim().min(4).max(20), semesterId: objectId.optional(), subjects: z.array(subject).default([]), startDate: z.coerce.date(), endDate: z.coerce.date(), status: z.enum(['draft', 'published', 'closed']).optional() }).refine((value) => value.startDate <= value.endDate, { message: 'End date must be after start date', path: ['endDate'] })
export const examUpdateSchema = examSchema.partial()
export const marksSchema = z.object({ entries: z.array(z.object({ studentId: objectId, subjectId: objectId, marks: z.number().min(0), maxMarks: z.number().positive(), remarks: z.string().trim().max(500).optional() })).min(1).max(500) })
