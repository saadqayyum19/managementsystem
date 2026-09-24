import { Schema, model, type InferSchemaType } from 'mongoose'
import { roleValues } from './Role.js'

export { type Role } from './Role.js'
export const roles = roleValues

const userSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  firstName: { type: String, required: true, trim: true, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: roleValues, default: 'student', index: true },
  permissions: { type: [String], default: [] },
  avatarUrl: String,
  isActive: { type: Boolean, default: true, index: true },
  isEmailVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String, select: false },
  refreshTokenHash: { type: String, select: false },
  otpHash: { type: String, select: false },
  otpExpiresAt: { type: Date, select: false },
  passwordResetHash: { type: String, select: false },
  passwordResetExpiresAt: { type: Date, select: false },
  lastLoginAt: Date,
}, { timestamps: true })

userSchema.index({ institutionId: 1, email: 1 }, { unique: true })
userSchema.index({ institutionId: 1, role: 1, isActive: 1 })

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId }
export const User = model('User', userSchema)
