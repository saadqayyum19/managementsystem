import { Schema, model } from 'mongoose'

const holidaySchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  type: { type: String, enum: ['national', 'religious', 'institutional', 'seasonal', 'other'], default: 'institutional' },
  isRecurring: { type: Boolean, default: false },
}, { timestamps: true })

export const Holiday = model('Holiday', holidaySchema)
