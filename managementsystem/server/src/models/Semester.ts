import { Schema, model } from 'mongoose'

const semesterSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  number: { type: Number, required: true, min: 1, max: 20 },
  academicYear: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isCurrent: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })
semesterSchema.index({ institutionId: 1, academicYear: 1, number: 1 }, { unique: true })
export const Semester = model('Semester', semesterSchema)
