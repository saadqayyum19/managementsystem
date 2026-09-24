import { Schema, model, type InferSchemaType } from 'mongoose'

const institutionSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  timezone: { type: String, default: 'UTC' },
  branding: { logoUrl: String, primaryColor: { type: String, default: '#2563eb' } },
  features: { type: Map, of: Boolean, default: {} },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export type InstitutionDocument = InferSchemaType<typeof institutionSchema>
export const Institution = model('Institution', institutionSchema)
