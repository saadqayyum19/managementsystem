import { Router } from 'express'
import { authenticate, requireRoles } from '../middleware/auth.js'
import {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveStatus,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/operations.js'

export const operationsRouter = Router()

operationsRouter.use(authenticate)

// Leaves
operationsRouter.get('/leaves', getLeaveRequests)
operationsRouter.post('/leaves', createLeaveRequest)
operationsRouter.patch('/leaves/:id/status', requireRoles('super_admin', 'principal', 'teacher'), updateLeaveStatus)

// Holidays
operationsRouter.get('/holidays', getHolidays)
operationsRouter.post('/holidays', requireRoles('super_admin', 'principal'), createHoliday)
operationsRouter.put('/holidays/:id', requireRoles('super_admin', 'principal'), updateHoliday)
operationsRouter.delete('/holidays/:id', requireRoles('super_admin', 'principal'), deleteHoliday)

// Events
operationsRouter.get('/events', getEvents)
operationsRouter.post('/events', requireRoles('super_admin', 'principal', 'teacher'), createEvent)
operationsRouter.put('/events/:id', requireRoles('super_admin', 'principal', 'teacher'), updateEvent)
operationsRouter.delete('/events/:id', requireRoles('super_admin', 'principal'), deleteEvent)
