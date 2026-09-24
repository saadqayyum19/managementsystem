import crypto from 'node:crypto'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { Role } from '../models/User.js'

export type AccessTokenPayload = { sub: string; institutionId: string; role: Role; type: 'access' }
export type RefreshTokenPayload = { sub: string; type: 'refresh' }

export function createAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  return jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] })
}

export function createRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload
  if (payload.type !== 'access') throw new Error('Invalid access token')
  return payload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
  if (payload.type !== 'refresh') throw new Error('Invalid refresh token')
  return payload
}

export function hashToken(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex')
}
