import { Schema, model } from 'mongoose'

const auditLogSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  action: { type: String, required: true, trim: true }, // e.g. 'USER_LOGIN', 'FEE_CREATED', 'ROLE_UPDATED'
  category: { type: String, enum: ['auth', 'user', 'academic', 'finance', 'system', 'communication', 'operations'], default: 'system' },
  details: { type: Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String,
  status: { type: String, enum: ['success', 'failure', 'warning'], default: 'success' },
}, { timestamps: true })

export const AuditLog = model('AuditLog', auditLogSchema)
