import { Schema, model } from 'mongoose'

const feeStructureSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 150 },
  type: { type: String, enum: ['tuition', 'admission', 'exam', 'transport', 'hostel', 'library', 'lab', 'other'], required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD', trim: true },
  frequency: { type: String, enum: ['one-time', 'monthly', 'quarterly', 'semester', 'annual'], default: 'annual' },
  classId: { type: Schema.Types.ObjectId, ref: 'AcademicClass' },
  dueDate: { type: Date },
  lateFee: { type: Number, default: 0, min: 0 },
  description: { type: String, trim: true, maxlength: 500 },
  isActive: { type: Boolean, default: true, index: true },
}, { timestamps: true })
feeStructureSchema.index({ institutionId: 1, type: 1 })
export const FeeStructure = model('FeeStructure', feeStructureSchema)
