import { Schema, model } from 'mongoose'

const feePaymentSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'stripe', 'paypal', 'cheque', 'online'], default: 'cash' },
  transactionId: { type: String, trim: true },
  status: { type: String, enum: ['successful', 'pending', 'failed', 'refunded'], default: 'successful' },
  receiptNumber: { type: String, required: true, trim: true },
  paymentDate: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
  collectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export const FeePayment = model('FeePayment', feePaymentSchema)
