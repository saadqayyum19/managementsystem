import { Schema, model } from 'mongoose'

const invoiceItemSchema = new Schema({
  feeStructureId: { type: Schema.Types.ObjectId, ref: 'FeeStructure' },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
}, { _id: false })

const invoiceSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  invoiceNumber: { type: String, required: true, unique: true, trim: true },
  items: { type: [invoiceItemSchema], required: true },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'], default: 'pending', index: true },
  notes: { type: String, trim: true, maxlength: 500 },
}, { timestamps: true })
invoiceSchema.index({ institutionId: 1, studentId: 1, status: 1 })
export const Invoice = model('Invoice', invoiceSchema)
