import { Schema, model } from 'mongoose'

const salarySchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  month: { type: String, required: true }, // e.g. '2026-09'
  baseSalary: { type: Number, required: true, min: 0 },
  allowances: { type: Number, default: 0, min: 0 },
  deductions: { type: Number, default: 0, min: 0 },
  netSalary: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['paid', 'pending', 'cancelled'], default: 'pending', index: true },
  paymentMethod: { type: String, enum: ['bank_transfer', 'cheque', 'cash', 'online'], default: 'bank_transfer' },
  paymentDate: Date,
  remarks: { type: String, trim: true },
}, { timestamps: true })

export const Salary = model('Salary', salarySchema)
