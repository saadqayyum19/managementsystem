import { Schema, model } from 'mongoose'

const programSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  code: { type: String, required: true, uppercase: true, trim: true, maxlength: 30 },
  level: { type: String, enum: ['school', 'undergraduate', 'postgraduate'], required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  durationYears: { type: Number, min: 0.5, max: 10 },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })
programSchema.index({ institutionId: 1, code: 1 }, { unique: true })
export const Program = model('Program', programSchema)
