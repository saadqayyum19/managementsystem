import { Timetable } from '../models/Timetable.js'
import { AppError, asyncHandler } from '../utils/errors.js'
import type { Request } from 'express'

type TimetableInput = { academicYear?: string; semesterId?: string; dayOfWeek?: number; startTime?: string; endTime?: string; subjectId?: string; classId?: string; sectionId?: string; teacherId?: string; substituteTeacherId?: string; room?: string; isActive?: boolean }
function overlaps(startA: string, endA: string, startB: string, endB: string) { return startA < endB && startB < endA }
async function findConflict(req: Request, input: TimetableInput, excludeId?: string) {
  if (!req.auth || input.dayOfWeek === undefined || !input.startTime || !input.endTime) return null
  const candidates = await Timetable.find({ institutionId: req.auth.institutionId, academicYear: input.academicYear, dayOfWeek: input.dayOfWeek, isActive: true, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }).lean()
  return candidates.find((entry) => overlaps(input.startTime!, input.endTime!, entry.startTime, entry.endTime) && (String(entry.teacherId) === input.teacherId || String(entry.classId) === input.classId || (input.room && entry.room && entry.room.toLowerCase() === input.room.toLowerCase()))) ?? null
}
function conflictMessage(conflict: { teacherId: unknown; classId: unknown; room?: string | null }) { return conflict.room ? 'This timetable conflicts with the teacher, class, or room booking' : 'This timetable conflicts with the teacher or class booking' }

export const listTimetable = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const filter: Record<string, unknown> = { institutionId: req.auth.institutionId }
  if (req.query.academicYear) filter.academicYear = req.query.academicYear
  if (req.query.dayOfWeek) filter.dayOfWeek = Number(req.query.dayOfWeek)
  if (req.query.teacherId) filter.teacherId = req.query.teacherId
  if (req.query.classId) filter.classId = req.query.classId
  const data = await Timetable.find(filter).sort({ dayOfWeek: 1, startTime: 1 }).populate('subjectId', 'name code').populate('classId', 'name code').populate('sectionId', 'name code').populate('teacherId', 'firstName lastName').lean()
  res.json({ success: true, data })
})

export const createTimetable = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const conflict = await findConflict(req, req.body as TimetableInput)
  if (conflict) throw new AppError(conflictMessage(conflict), 409, 'TIMETABLE_CONFLICT')
  const item = await Timetable.create({ ...req.body, institutionId: req.auth.institutionId })
  res.status(201).json({ success: true, data: item })
})

export const updateTimetable = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const entryId = String(req.params.id)
  const current = await Timetable.findOne({ _id: entryId, institutionId: req.auth.institutionId }).lean()
  if (!current) throw new AppError('Timetable entry not found', 404, 'RECORD_NOT_FOUND')
  const input = { ...current, ...req.body } as TimetableInput
  const conflict = await findConflict(req, input, entryId)
  if (conflict) throw new AppError(conflictMessage(conflict), 409, 'TIMETABLE_CONFLICT')
  const item = await Timetable.findOneAndUpdate({ _id: entryId, institutionId: req.auth.institutionId }, { $set: req.body }, { new: true, runValidators: true }).lean()
  res.json({ success: true, data: item })
})

export const deleteTimetable = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const item = await Timetable.findOneAndUpdate({ _id: req.params.id, institutionId: req.auth.institutionId }, { $set: { isActive: false } }, { new: true }).lean()
  if (!item) throw new AppError('Timetable entry not found', 404, 'RECORD_NOT_FOUND')
  res.json({ success: true, data: { id: req.params.id, isActive: false } })
})
