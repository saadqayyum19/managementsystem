import type { NextFunction, Request, Response } from 'express'
import { roleHasPermission, type Permission } from '../config/permissions.js'
import { User, type Role } from '../models/User.js'
import { AppError } from '../utils/errors.js'
import { verifyAccessToken } from '../utils/tokens.js'

declare global {
  namespace Express { interface Request { auth?: { userId: string; institutionId: string; role: Role; permissions: string[] } } }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.header('authorization')
    if (!header?.startsWith('Bearer ')) throw new AppError('Authentication required', 401, 'AUTH_REQUIRED')
    const payload = verifyAccessToken(header.slice(7))
    const user = await User.findOne({ _id: payload.sub, isActive: true }).select('_id institutionId role permissions').lean()
    if (!user) throw new AppError('User account is inactive or missing', 401, 'ACCOUNT_INACTIVE')
    req.auth = { userId: String(user._id), institutionId: String(user.institutionId), role: user.role as Role, permissions: user.permissions ?? [] }
    next()
  } catch (error) { next(error instanceof AppError ? error : new AppError('Invalid or expired access token', 401, 'TOKEN_INVALID')) }
}

export function requirePermissions(...requiredPermissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'))
    const allowed = requiredPermissions.every((permission) => roleHasPermission(req.auth!.role, permission, req.auth!.permissions))
    if (!allowed) return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'))
    next()
  }
}

export function requireAnyPermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'))
    const allowed = permissions.some((permission) => roleHasPermission(req.auth!.role, permission, req.auth!.permissions))
    if (!allowed) return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'))
    next()
  }
}

export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'))
    if (!allowedRoles.includes(req.auth.role)) return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'))
    next()
  }
}
