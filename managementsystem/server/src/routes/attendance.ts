import { Router } from 'express'
import { Permission } from '../config/permissions.js'
import { attendanceReport, listAttendance, markAttendance } from '../controllers/attendance.js'
import { authenticate, requirePermissions } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { bulkAttendanceSchema } from '../validators/attendance.js'

export const attendanceRouter = Router()
attendanceRouter.use(authenticate)
attendanceRouter.get('/', requirePermissions(Permission.ATTENDANCE_READ), listAttendance)
attendanceRouter.get('/report', requirePermissions(Permission.ATTENDANCE_READ), attendanceReport)
attendanceRouter.post('/bulk', requirePermissions(Permission.ATTENDANCE_WRITE), validate(bulkAttendanceSchema), markAttendance)
