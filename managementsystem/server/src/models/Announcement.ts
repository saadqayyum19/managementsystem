import { Schema, model } from 'mongoose'

const announcementSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetRoles: { type: [String], default: ['student', 'teacher', 'parent', 'principal', 'admin', 'super_admin'] },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  category: { type: String, enum: ['general', 'academic', 'exam', 'fee', 'event', 'emergency'], default: 'general' },
  attachments: [{ name: String, url: String }],
  isPublished: { type: Boolean, default: true },
  publishDate: { type: Date, default: Date.now },
  expiryDate: Date,
}, { timestamps: true })

export const Announcement = model('Announcement', announcementSchema)
