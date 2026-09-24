import { Schema, model } from 'mongoose'

const academicClassSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  code: { type: String, required: true, uppercase: true, trim: true, maxlength: 30 },
  gradeLevel: { type: Number, required: true, min: 1, max: 20 },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
  academicYear: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })
academicClassSchema.index({ institutionId: 1, code: 1 }, { unique: true })
export const AcademicClass = model('AcademicClass', academicClassSchema)
