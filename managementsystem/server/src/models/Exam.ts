import { Schema, model } from 'mongoose'

const examSubjectSchema = new Schema({ subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true }, maxMarks: { type: Number, required: true, min: 1 }, passMarks: { type: Number, required: true, min: 0 } }, { _id: false })
const examSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  examType: { type: String, enum: ['unit', 'midterm', 'final', 'entrance', 'quiz'], required: true },
  academicYear: { type: String, required: true, trim: true },
  semesterId: { type: Schema.Types.ObjectId, ref: 'Semester' },
  subjects: { type: [examSubjectSchema], default: [] },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft', index: true },
}, { timestamps: true })
examSchema.index({ institutionId: 1, academicYear: 1, status: 1 })
export const Exam = model('Exam', examSchema)
