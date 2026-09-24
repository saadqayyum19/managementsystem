import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id')
const status = z.enum(['present', 'absent', 'late', 'excused'])
const attendanceEntry = z.object({ studentId: objectId, classId: objectId, sectionId: objectId.optional(), status, method: z.enum(['manual', 'qr', 'face']).default('manual'), notes: z.string().trim().max(500).optional() })
export const bulkAttendanceSchema = z.object({ date: z.coerce.date(), entries: z.array(attendanceEntry).min(1).max(1000) })
export const attendanceQuerySchema = z.object({ date: z.coerce.date().optional(), from: z.coerce.date().optional(), to: z.coerce.date().optional(), studentId: objectId.optional(), classId: objectId.optional(), sectionId: objectId.optional(), status: status.optional(), page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(50) })
