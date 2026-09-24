import { Schema, model } from 'mongoose'

const subjectSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  code: { type: String, required: true, uppercase: true, trim: true, maxlength: 30 },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  credits: { type: Number, min: 0, max: 50, default: 1 },
  type: { type: String, enum: ['core', 'elective', 'activity'], default: 'core' },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })
subjectSchema.index({ institutionId: 1, code: 1 }, { unique: true })
export const Subject = model('Subject', subjectSchema)
