import { Schema, model } from 'mongoose'

const scholarshipSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  type: { type: String, enum: ['merit', 'need_based', 'sports', 'special'], default: 'merit' },
  discountPercentage: { type: Number, min: 0, max: 100 },
  fixedAmount: { type: Number, min: 0 },
  academicYear: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  beneficiaries: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export const Scholarship = model('Scholarship', scholarshipSchema)
