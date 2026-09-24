import bcrypt from 'bcryptjs'
import { Types } from 'mongoose'
import type { Request, Response } from 'express'
import { User } from '../models/User.js'
import { Timetable } from '../models/Timetable.js'
import { AppError, asyncHandler } from '../utils/errors.js'

function publicUser(user: Record<string, unknown>) {
  return { id: String(user._id), institutionId: String(user.institutionId), firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, role: user.role, permissions: user.permissions ?? [], avatarUrl: user.avatarUrl, isActive: user.isActive, isEmailVerified: user.isEmailVerified, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt }
}
function escapeRegex(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }
function assertCanManageTarget(req: Request, targetRole?: string) {
  if (req.auth?.role === 'principal' && targetRole === 'super_admin') throw new AppError('Principals cannot manage Super Admin accounts', 403, 'FORBIDDEN')
}

export const listUsers = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const page = Math.max(Number(req.query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100)
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const role = typeof req.query.role === 'string' ? req.query.role : undefined
  const isActive = req.query.isActive === undefined ? undefined : req.query.isActive === 'true'
  const filter: Record<string, unknown> = { institutionId: req.auth.institutionId }
  if (search) filter.$or = [{ firstName: { $regex: escapeRegex(search), $options: 'i' } }, { lastName: { $regex: escapeRegex(search), $options: 'i' } }, { email: { $regex: escapeRegex(search), $options: 'i' } }]
  if (role) filter.role = role
  if (isActive !== undefined) filter.isActive = isActive
  const [users, total] = await Promise.all([
    User.find(filter).select('-passwordHash -refreshTokenHash -otpHash -otpExpiresAt -passwordResetHash -passwordResetExpiresAt -twoFactorSecret').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter),
  ])
  res.json({ success: true, data: users.map((user) => publicUser(user)), meta: { page, limit, total, pages: Math.ceil(total / limit) } })
})

export const teacherWorkload = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const teachers = await User.find({ institutionId: req.auth.institutionId, role: 'teacher', isActive: true }).select('_id firstName lastName email avatarUrl').lean()
  const workload = await Timetable.aggregate([{ $match: { institutionId: new Types.ObjectId(req.auth.institutionId), isActive: true } }, { $group: { _id: '$teacherId', classes: { $sum: 1 }, weeklyMinutes: { $sum: 60 } } }])
  const workloadMap = new Map(workload.map((entry) => [String(entry._id), entry]))
  res.json({ success: true, data: teachers.map((teacher) => ({ ...teacher, id: String(teacher._id), classes: workloadMap.get(String(teacher._id))?.classes ?? 0, weeklyMinutes: workloadMap.get(String(teacher._id))?.weeklyMinutes ?? 0 })) })
})

export const getUser = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const user = await User.findOne({ _id: req.params.id, institutionId: req.auth.institutionId }).select('-passwordHash -refreshTokenHash -otpHash -otpExpiresAt -passwordResetHash -passwordResetExpiresAt -twoFactorSecret').lean()
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  res.json({ success: true, data: publicUser(user) })
})

export const createUser = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const { firstName, lastName, email, phone, password, role, permissions, avatarUrl } = req.body as { firstName: string; lastName: string; email: string; phone?: string; password: string; role: string; permissions: string[]; avatarUrl?: string }
  assertCanManageTarget(req, role)
  const normalizedEmail = email.toLowerCase()
  const existing = await User.findOne({ institutionId: req.auth.institutionId, email: normalizedEmail }).select('_id')
  if (existing) throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS')
  const user = await User.create({ institutionId: req.auth.institutionId, firstName, lastName, email: normalizedEmail, phone, passwordHash: await bcrypt.hash(password, 12), role, permissions, avatarUrl })
  res.status(201).json({ success: true, data: publicUser(user.toObject()) })
})

export const updateUser = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  const user = await User.findOne({ _id: req.params.id, institutionId: req.auth.institutionId }).select('+passwordHash')
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  assertCanManageTarget(req, req.body.role ?? user.role)
  const { password, email, ...updates } = req.body as { password?: string; email?: string; [key: string]: unknown }
  if (email && email.toLowerCase() !== user.email) {
    const duplicate = await User.findOne({ institutionId: req.auth.institutionId, email: email.toLowerCase(), _id: { $ne: user._id } }).select('_id')
    if (duplicate) throw new AppError('An account with this email already exists', 409, 'EMAIL_EXISTS')
    updates.email = email.toLowerCase()
  }
  Object.assign(user, updates)
  if (password) user.passwordHash = await bcrypt.hash(password, 12)
  await user.save()
  res.json({ success: true, data: publicUser(user.toObject()) })
})

export const deleteUser = asyncHandler(async (req, res) => {
  if (!req.auth) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
  if (req.params.id === req.auth.userId) throw new AppError('You cannot deactivate your own account', 400, 'SELF_DEACTIVATION')
  const user = await User.findOne({ _id: req.params.id, institutionId: req.auth.institutionId })
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  assertCanManageTarget(req, user.role)
  user.isActive = false
  user.refreshTokenHash = undefined
  await user.save()
  res.json({ success: true, data: { id: String(user._id), isActive: false } })
})
