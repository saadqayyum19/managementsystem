import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid MongoDB id')
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM time format')
export const timetableSchema = z.object({
  academicYear: z.string().trim().min(4).max(20),
  semesterId: objectId.optional(),
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: time,
  endTime: time,
  subjectId: objectId,
  classId: objectId,
  sectionId: objectId.optional(),
  teacherId: objectId,
  substituteTeacherId: objectId.optional(),
  room: z.string().trim().max(80).optional(),
  isActive: z.boolean().optional(),
}).refine((value) => value.startTime < value.endTime, { message: 'End time must be after start time', path: ['endTime'] })
export const timetableUpdateSchema = timetableSchema.partial()
