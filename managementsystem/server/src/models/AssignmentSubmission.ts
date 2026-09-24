import { Schema, model } from 'mongoose'

const submissionSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  assignmentId: { type: Schema.Types.ObjectId, ref: 'Assignment', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  content: { type: String, trim: true, maxlength: 10000 },
  attachments: [{ name: String, url: String, mimeType: String }],
  submittedAt: Date,
  marks: { type: Number, min: 0 },
  feedback: { type: String, trim: true, maxlength: 3000 },
  gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  gradedAt: Date,
  status: { type: String, enum: ['draft', 'submitted', 'graded', 'returned'], default: 'draft' },
}, { timestamps: true })
submissionSchema.index({ institutionId: 1, assignmentId: 1, studentId: 1 }, { unique: true })
export const AssignmentSubmission = model('AssignmentSubmission', submissionSchema)
