import { Schema, model } from 'mongoose'

const sectionSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  classId: { type: Schema.Types.ObjectId, ref: 'AcademicClass', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  code: { type: String, required: true, uppercase: true, trim: true, maxlength: 20 },
  capacity: { type: Number, min: 1, max: 500 },
  room: { type: String, trim: true, maxlength: 80 },
  classTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })
sectionSchema.index({ institutionId: 1, classId: 1, code: 1 }, { unique: true })
export const Section = model('Section', sectionSchema)
