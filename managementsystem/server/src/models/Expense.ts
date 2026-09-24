import { Schema, model } from 'mongoose'

const expenseSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  title: { type: String, required: true, trim: true },
  category: { type: String, enum: ['utilities', 'maintenance', 'supplies', 'events', 'salaries', 'marketing', 'other'], default: 'other', index: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now },
  description: { type: String, trim: true },
  receiptUrl: String,
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export const Expense = model('Expense', expenseSchema)
