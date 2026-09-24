import { Schema, model } from 'mongoose'

const featureToggleSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  featureKey: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  isEnabled: { type: Boolean, default: true },
  category: { type: String, default: 'general' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

featureToggleSchema.index({ institutionId: 1, featureKey: 1 }, { unique: true })

export const FeatureToggle = model('FeatureToggle', featureToggleSchema)
