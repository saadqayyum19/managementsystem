import { Schema, model } from 'mongoose'

const rubricSchema = new Schema({ criterion: { type: String, required: true, trim: true }, points: { type: Number, required: true, min: 0 } }, { _id: false })
const assignmentSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, trim: true, maxlength: 5000 },
  classId: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true, index: true },
  sectionId: { type: Schema.Types.ObjectId, ref: 'Section' },
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  dueDate: { type: Date, required: true, index: true },
  maxMarks: { type: Number, required: true, min: 1 },
  attachments: [{ name: String, url: String, mimeType: String }],
  rubric: { type: [rubricSchema], default: [] },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft', index: true },
}, { timestamps: true })
assignmentSchema.index({ institutionId: 1, classId: 1, dueDate: -1 })
export const Assignment = model('Assignment', assignmentSchema)
