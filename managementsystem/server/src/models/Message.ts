import { Schema, model } from 'mongoose'

const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text: { type: String },
  content: { type: String },
  attachments: [{ name: String, url: String, type: String }],
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

messageSchema.pre('save', function (this: any, next) {
  if (!this.text && this.content) this.text = this.content
  if (!this.content && this.text) this.content = this.text
  next()
})

export const Message = model('Message', messageSchema)
