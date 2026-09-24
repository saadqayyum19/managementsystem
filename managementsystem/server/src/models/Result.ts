import { Schema, model } from 'mongoose'

const resultSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  totalMarks: { type: Number, required: true, min: 0 },
  obtainedMarks: { type: Number, required: true, min: 0 },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  gpa: { type: Number, required: true, min: 0, max: 4 },
  grade: { type: String, required: true },
  isPublished: { type: Boolean, default: false },
  publishedAt: Date,
}, { timestamps: true })
resultSchema.index({ institutionId: 1, examId: 1, studentId: 1 }, { unique: true })
export const Result = model('Result', resultSchema)
