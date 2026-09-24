import { z } from 'zod'
const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id')
const attachment = z.object({ name: z.string().min(1), url: z.string().url(), mimeType: z.string().optional() })
const rubric = z.object({ criterion: z.string().min(1).max(200), points: z.number().min(0) })
export const assignmentSchema = z.object({ title: z.string().trim().min(1).max(180), description: z.string().trim().max(5000).optional(), classId: objectId, sectionId: objectId.optional(), subjectId: objectId, dueDate: z.coerce.date(), maxMarks: z.number().positive(), attachments: z.array(attachment).max(20).optional(), rubric: z.array(rubric).max(30).optional(), status: z.enum(['draft', 'published', 'closed']).optional() })
export const assignmentUpdateSchema = assignmentSchema.partial()
export const submissionSchema = z.object({ content: z.string().trim().max(10000).optional(), attachments: z.array(attachment).max(20).optional(), status: z.enum(['draft', 'submitted']).default('submitted') })
export const gradeSchema = z.object({ marks: z.number().min(0), feedback: z.string().trim().max(3000).optional(), status: z.enum(['graded', 'returned']).default('graded') })
