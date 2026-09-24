import { Schema, model } from 'mongoose'

const conversationSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  type: { type: String, enum: ['direct', 'group'], default: 'direct' },
  title: { type: String, trim: true },
  lastMessage: {
    text: String,
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  unreadCounts: { type: Map, of: Number, default: {} },
}, { timestamps: true })

conversationSchema.index({ participants: 1 })

export const Conversation = model('Conversation', conversationSchema)
