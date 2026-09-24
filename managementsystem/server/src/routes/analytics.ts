import { Router } from 'express'
import { authenticate, requireRoles } from '../middleware/auth.js'
import {
  getDashboardAnalytics,
  getStudentPerformanceAnalytics,
  getAttendanceTrends,
  getTeacherEffectiveness,
  getAtRiskStudents,
} from '../controllers/analytics.js'

export const analyticsRouter = Router()

analyticsRouter.use(authenticate)

analyticsRouter.get('/dashboard', getDashboardAnalytics)
analyticsRouter.get('/student-performance', requireRoles('super_admin', 'principal', 'teacher'), getStudentPerformanceAnalytics)
analyticsRouter.get('/attendance-trends', requireRoles('super_admin', 'principal', 'teacher'), getAttendanceTrends)
analyticsRouter.get('/teacher-effectiveness', requireRoles('super_admin', 'principal'), getTeacherEffectiveness)
analyticsRouter.get('/at-risk', requireRoles('super_admin', 'principal', 'teacher'), getAtRiskStudents)
