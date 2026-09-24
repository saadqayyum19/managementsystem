import { Schema, model } from 'mongoose'

const leaveRequestSchema = new Schema({
  institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  leaveType: { type: String, enum: ['sick', 'casual', 'annual', 'maternity', 'unpaid', 'other'], default: 'casual' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending', index: true },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  reviewRemarks: { type: String, trim: true },
  appliedAt: { type: Date, default: Date.now },
}, { timestamps: true })

export const LeaveRequest = model('LeaveRequest', leaveRequestSchema)
