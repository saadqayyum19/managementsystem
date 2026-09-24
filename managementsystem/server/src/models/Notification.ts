import { Schema, model } from 'mongoose'

const notificationSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true, trim: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'error', 'announcement', 'message', 'attendance', 'exam', 'fee'], default: 'info' },
  link: String,
  isRead: { type: Boolean, default: false, index: true },
  readAt: Date,
}, { timestamps: true })

export const Notification = model('Notification', notificationSchema)
