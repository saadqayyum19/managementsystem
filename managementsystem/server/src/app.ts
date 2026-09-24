import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { env } from './config/env.js'
import { authRouter } from './routes/auth.js'
import { academicsRouter } from './routes/academics.js'
import { timetableRouter } from './routes/timetable.js'
import { attendanceRouter } from './routes/attendance.js'
import { examsRouter } from './routes/exams.js'
import { assignmentsRouter } from './routes/assignments.js'
import { systemRouter } from './routes/system.js'
import { usersRouter } from './routes/users.js'
import { feesRouter } from './routes/fees.js'
import { operationsRouter } from './routes/operations.js'
import { communicationRouter } from './routes/communication.js'
import { analyticsRouter } from './routes/analytics.js'
import { errorHandler } from './utils/errors.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
  app.use(compression())
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true, limit: '1mb' }))
  app.use(cookieParser())
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))

  // API v1 routes
  app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false }), authRouter)
  app.use('/api/v1/academics', academicsRouter)
  app.use('/api/v1/timetable', timetableRouter)
  app.use('/api/v1/attendance', attendanceRouter)
  app.use('/api/v1/exams', examsRouter)
  app.use('/api/v1/assignments', assignmentsRouter)
  app.use('/api/v1/users', usersRouter)
  app.use('/api/v1/fees', feesRouter)
  app.use('/api/v1/operations', operationsRouter)
  app.use('/api/v1/communication', communicationRouter)
  app.use('/api/v1/analytics', analyticsRouter)
  app.use('/api/v1/system', systemRouter)

  app.get('/api/v1/docs', (_req, res) => res.json({
    openapi: '3.0.3',
    info: { title: 'EduCore OS API', version: '1.0.0' },
    servers: [{ url: `http://localhost:${env.PORT}/api/v1` }],
    paths: {
      '/auth/login': { post: { summary: 'Login and issue tokens' } },
      '/auth/register': { post: { summary: 'Register a user' } },
      '/auth/refresh': { post: { summary: 'Rotate refresh token' } },
      '/auth/me': { get: { summary: 'Get current user' } },
      '/users': { get: { summary: 'List users' }, post: { summary: 'Create user' } },
      '/academics/{resource}': { get: { summary: 'List academic records' }, post: { summary: 'Create academic record' } },
      '/fees/structures': { get: { summary: 'List fee structures' }, post: { summary: 'Create fee structure' } },
      '/fees/invoices': { get: { summary: 'List invoices' }, post: { summary: 'Create invoice' } },
      '/communication/announcements': { get: { summary: 'List announcements' }, post: { summary: 'Create announcement' } },
      '/communication/conversations': { get: { summary: 'List conversations' } },
      '/analytics/dashboard': { get: { summary: 'Dashboard stats' } },
      '/system/audit-logs': { get: { summary: 'List audit logs' } },
    },
  }))

  app.use((_req, res) => res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }))
  app.use(errorHandler)
  return app
}
