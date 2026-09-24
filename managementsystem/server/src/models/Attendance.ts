import { Schema, model } from 'mongoose'

const attendanceSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  classId: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true, index: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
  date: { type: Date, required: true, index: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
  method: { type: String, enum: ['manual', 'qr', 'face'], default: 'manual' },
  markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true })

attendanceSchema.index({ institutionId: 1, studentId: 1, date: 1 }, { unique: true })
attendanceSchema.index({ institutionId: 1, classId: 1, sectionId: 1, date: 1 })
export const Attendance = model('Attendance', attendanceSchema)
