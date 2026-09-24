import type { Request, Response } from 'express'
import { AuditLog } from '../models/AuditLog.js'
import { FeatureToggle } from '../models/FeatureToggle.js'
import { User } from '../models/User.js'
import { rolePermissions, Permission } from '../config/permissions.js'
import { Role } from '../models/Role.js'
import { AppError, asyncHandler } from '../utils/errors.js'

// --- Audit Logs ---
export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 15, category, search, status } = req.query

  const query: any = { institutionId }
  if (category) query.category = category
  if (status) query.status = status
  if (search) query.action = { $regex: String(search), $options: 'i' }

  const skip = (Number(page) - 1) * Number(limit)
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .populate('userId', 'firstName lastName email role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    AuditLog.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createAuditLog = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const log = await AuditLog.create({
    ...req.body,
    institutionId,
    userId: req.auth!.userId,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })
  res.status(201).json({ success: true, data: log })
})

// --- Feature Toggles ---
export const getFeatureToggles = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  let features = await FeatureToggle.find({ institutionId }).sort({ category: 1, name: 1 })

  // If no toggles exist yet, seed the defaults
  if (features.length === 0) {
    const defaults = [
      { featureKey: 'chat_module', name: 'Real-time Chat & Messaging', description: 'Enable direct messages and channel discussions', category: 'Communication', isEnabled: true },
      { featureKey: 'attendance_tracking', name: 'Live Attendance Module', description: 'Record daily attendance per section or class', category: 'Academics', isEnabled: true },
      { featureKey: 'online_fee_payments', name: 'Online Fee Gateway', description: 'Permit credit card and gateway fee settlements', category: 'Finance', isEnabled: true },
      { featureKey: 'exam_results_portal', name: 'Public Examination Results', description: 'Publish student report cards to student & parent dashboards', category: 'Academics', isEnabled: true },
      { featureKey: 'leave_approvals', name: 'Staff & Student Leave Flow', description: 'Workflow for applying and authorizing leave requests', category: 'Operations', isEnabled: true },
      { featureKey: 'audit_logging', name: 'Security Audit Log Streaming', description: 'Log all critical mutations to an immutable audit ledger', category: 'System', isEnabled: true },
    ]
    for (const d of defaults) {
      await FeatureToggle.findOneAndUpdate({ institutionId, featureKey: d.featureKey }, { ...d, institutionId }, { upsert: true })
    }
    features = await FeatureToggle.find({ institutionId }).sort({ category: 1, name: 1 })
  }

  res.json({ success: true, data: features })
})

export const toggleFeature = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { key } = req.params
  const { isEnabled } = req.body

  const feature = await FeatureToggle.findOneAndUpdate(
    { institutionId, featureKey: key },
    { isEnabled, updatedBy: req.auth!.userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  res.json({ success: true, data: feature, message: `Feature ${key} updated` })
})

// --- RBAC Editor ---
export const getRbacRoles = asyncHandler(async (_req: Request, res: Response) => {
  const allRoles = Object.values(Role).map((role) => ({
    role,
    permissions: rolePermissions[role as keyof typeof rolePermissions] || [],
  }))

  const allAvailablePermissions = Object.entries(Permission).map(([name, code]) => ({
    name: name.replace(/_/g, ' '),
    code,
  }))

  res.json({
    success: true,
    data: {
      roles: allRoles,
      availablePermissions: allAvailablePermissions,
    },
  })
})

export const updateUserRbac = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { id } = req.params
  const { role, permissions } = req.body

  const updateData: any = {}
  if (role) updateData.role = role
  if (permissions) updateData.permissions = permissions

  const user = await User.findOneAndUpdate(
    { _id: id, institutionId },
    updateData,
    { new: true }
  ).select('_id firstName lastName email role permissions isActive')

  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')

  // Log this RBAC update to audit log
  await AuditLog.create({
    institutionId,
    userId: req.auth!.userId,
    action: 'RBAC_USER_UPDATED',
    category: 'system',
    details: { targetUserId: id, role, permissions },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  })

  res.json({ success: true, data: user, message: 'User role and permissions updated successfully' })
})
