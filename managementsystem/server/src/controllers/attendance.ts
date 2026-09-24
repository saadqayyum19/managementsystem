import { Types } from 'mongoose'
import { Attendance } from '../models/Attendance.js'
import { AppError, asyncHandler } from '../utils/errors.js'
import { attendanceQuerySchema } from '../validators/attendance.js'
import type { Request } from 'express'

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'
type AttendanceMethod = 'manual' | 'qr' | 'face'

function dayStart(date: Date) { const value = new Date(date); value.setHours(0, 0, 0, 0); return value }
function dayEnd(date: Date) { const value = dayStart(date); value.setDate(value.getDate() + 1); return value }
function buildFilter(req: Request) { if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED'); const parsed = attendanceQuerySchema.parse(req.query); const filter: Record<string, unknown> = { institutionId: req.auth.institutionId }; if (parsed.date) filter.date = { $gte: dayStart(parsed.date), $lt: dayEnd(parsed.date) }; else if (parsed.from || parsed.to) filter.date = { ...(parsed.from ? { $gte: dayStart(parsed.from) } : {}), ...(parsed.to ? { $lt: dayEnd(parsed.to) } : {}) }; if (parsed.studentId) filter.studentId = parsed.studentId; if (parsed.classId) filter.classId = parsed.classId; if (parsed.sectionId) filter.sectionId = parsed.sectionId; if (parsed.status) filter.status = parsed.status; return { filter, parsed } }

export const listAttendance = asyncHandler(async (req, res) => { const { filter, parsed } = buildFilter(req); const [data, total] = await Promise.all([Attendance.find(filter).sort({ date: -1, studentId: 1 }).skip((parsed.page - 1) * parsed.limit).limit(parsed.limit).populate('studentId', 'firstName lastName email').populate('classId', 'name code').lean(), Attendance.countDocuments(filter)]); res.json({ success: true, data, meta: { page: parsed.page, limit: parsed.limit, total, pages: Math.ceil(total / parsed.limit) } }) })

export const markAttendance = asyncHandler(async (req, res) => {
	if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
	const { date, entries } = req.body as { date: Date; entries: Array<{ studentId: string; classId: string; sectionId?: string; status: AttendanceStatus; method: AttendanceMethod; notes?: string }> }
	const institutionId = new Types.ObjectId(req.auth.institutionId)
	const markedBy = new Types.ObjectId(req.auth.userId)
	const start = dayStart(new Date(date))
	const end = dayEnd(new Date(date))
	const operations = entries.map((entry) => {
		const studentId = new Types.ObjectId(entry.studentId)
		const classId = new Types.ObjectId(entry.classId)
		const sectionId = entry.sectionId ? new Types.ObjectId(entry.sectionId) : undefined
		return { updateOne: { filter: { institutionId, studentId, date: { $gte: start, $lt: end } }, update: { $set: { ...entry, institutionId, studentId, classId, sectionId, date: start, markedBy } }, upsert: true } }
	})
	const result = await Attendance.bulkWrite(operations)
	res.json({ success: true, data: { matched: result.matchedCount, upserted: result.upsertedCount, modified: result.modifiedCount } })
})

export const attendanceReport = asyncHandler(async (req, res) => { const { filter } = buildFilter(req); const rows = await Attendance.aggregate([{ $match: filter }, { $group: { _id: '$studentId', total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } }, absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } }, late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } } } }, { $addFields: { attendanceRate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] } } }, { $sort: { attendanceRate: 1 } }]); const defaulters = rows.filter((row) => row.attendanceRate < 75); res.json({ success: true, data: { summary: { totalStudents: rows.length, averageRate: rows.length ? rows.reduce((sum, row) => sum + row.attendanceRate, 0) / rows.length : 0, defaulters: defaulters.length }, students: rows, defaulters } }) })
