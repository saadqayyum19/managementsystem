import { Schema, model } from 'mongoose'

const departmentSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  code: { type: String, required: true, uppercase: true, trim: true, maxlength: 30 },
  description: { type: String, trim: true, maxlength: 500 },
  headTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })
departmentSchema.index({ institutionId: 1, code: 1 }, { unique: true })
export const Department = model('Department', departmentSchema)
