import { Router } from 'express'
import { authenticate, requireRoles } from '../middleware/auth.js'
import {
  getAuditLogs,
  createAuditLog,
  getFeatureToggles,
  toggleFeature,
  getRbacRoles,
  updateUserRbac,
} from '../controllers/system.js'

export const systemRouter = Router()

systemRouter.get('/health', (_req, res) =>
  res.json({ success: true, data: { service: 'educore-api', status: 'ok', timestamp: new Date().toISOString() } })
)

systemRouter.use(authenticate)

systemRouter.get('/admin-check', requireRoles('super_admin'), (_req, res) =>
  res.json({ success: true, data: { message: 'Super Admin access granted' } })
)

// Audit Logs
systemRouter.get('/audit-logs', requireRoles('super_admin', 'principal'), getAuditLogs)
systemRouter.post('/audit-logs', createAuditLog)

// Feature Toggles
systemRouter.get('/features', getFeatureToggles)
systemRouter.patch('/features/:key', requireRoles('super_admin'), toggleFeature)

// RBAC
systemRouter.get('/rbac/roles', requireRoles('super_admin', 'principal'), getRbacRoles)
systemRouter.patch('/rbac/users/:id', requireRoles('super_admin'), updateUserRbac)
