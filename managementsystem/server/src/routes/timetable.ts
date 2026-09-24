import { Router } from 'express'
import { Permission } from '../config/permissions.js'
import { createTimetable, deleteTimetable, listTimetable, updateTimetable } from '../controllers/timetable.js'
import { authenticate, requirePermissions } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { timetableSchema, timetableUpdateSchema } from '../validators/timetable.js'

export const timetableRouter = Router()
timetableRouter.use(authenticate)
timetableRouter.get('/', requirePermissions(Permission.ACADEMICS_READ), listTimetable)
timetableRouter.post('/', requirePermissions(Permission.ACADEMICS_WRITE), validate(timetableSchema), createTimetable)
timetableRouter.patch('/:id', requirePermissions(Permission.ACADEMICS_WRITE), validate(timetableUpdateSchema), updateTimetable)
timetableRouter.delete('/:id', requirePermissions(Permission.ACADEMICS_WRITE), deleteTimetable)
