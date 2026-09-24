import { Schema, model } from 'mongoose'

const eventSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: String, enum: ['academic', 'sports', 'cultural', 'meeting', 'workshop', 'seminar', 'other'], default: 'academic' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, trim: true },
  targetAudience: { type: [String], enum: ['all', 'teachers', 'students', 'parents', 'staff'], default: ['all'] },
  organizer: { type: Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true })

export const Event = model('Event', eventSchema)
