import { Schema, model } from 'mongoose'

const marksSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  marks: { type: Number, required: true, min: 0 },
  maxMarks: { type: Number, required: true, min: 1 },
  grade: { type: String, trim: true },
  remarks: { type: String, trim: true, maxlength: 500 },
  enteredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true })
marksSchema.index({ institutionId: 1, examId: 1, studentId: 1, subjectId: 1 }, { unique: true })
export const Marks = model('Marks', marksSchema)
