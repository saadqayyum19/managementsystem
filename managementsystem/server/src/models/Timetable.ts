import { Schema, model } from 'mongoose'

const timetableSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  academicYear: { type: String, required: true, trim: true },
  semesterId: { type: Schema.Types.ObjectId, ref: 'Semester' },
  dayOfWeek: { type: Number, required: true, min: 1, max: 7, index: true },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  classId: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true, index: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  substituteTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  room: { type: String, trim: true, maxlength: 80 },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })

timetableSchema.index({ institutionId: 1, academicYear: 1, dayOfWeek: 1, startTime: 1 })
export const Timetable = model('Timetable', timetableSchema)
