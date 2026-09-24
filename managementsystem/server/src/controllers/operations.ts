import type { Request, Response } from 'express'
import { LeaveRequest } from '../models/LeaveRequest.js'
import { Holiday } from '../models/Holiday.js'
import { Event } from '../models/Event.js'
import { AppError, asyncHandler } from '../utils/errors.js'

// --- Leave Requests ---
export const getLeaveRequests = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 10, status, leaveType } = req.query

  const query: any = { institutionId }
  if (status) query.status = status
  if (leaveType) query.leaveType = leaveType

  // If student or teacher viewing their own leaves (unless principal/admin)
  if (req.auth!.role === 'student') {
    query.userId = req.auth!.userId
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [leaves, total] = await Promise.all([
    LeaveRequest.find(query)
      .populate('userId', 'firstName lastName email role')
      .populate('reviewedBy', 'firstName lastName')
      .skip(skip)
      .limit(Number(limit))
      .sort({ appliedAt: -1 }),
    LeaveRequest.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: leaves,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createLeaveRequest = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const userId = req.auth!.userId
  const leave = await LeaveRequest.create({
    ...req.body,
    institutionId,
    userId,
    status: 'pending',
    appliedAt: new Date(),
  })
  res.status(201).json({ success: true, data: leave, message: 'Leave request submitted successfully' })
})

export const updateLeaveStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const { status, reviewRemarks } = req.body
  if (!['approved', 'rejected', 'cancelled'].includes(status)) {
    throw new AppError('Invalid leave status', 400, 'INVALID_STATUS')
  }

  const leave = await LeaveRequest.findOneAndUpdate(
    { _id: id, institutionId: req.auth!.institutionId },
    { status, reviewRemarks, reviewedBy: req.auth!.userId },
    { new: true }
  ).populate('userId', 'firstName lastName email')

  if (!leave) throw new AppError('Leave request not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: leave, message: `Leave request ${status} successfully` })
})

// --- Holidays ---
export const getHolidays = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 20, search, type } = req.query

  const query: any = { institutionId }
  if (type) query.type = type
  if (search) query.title = { $regex: String(search), $options: 'i' }

  const skip = (Number(page) - 1) * Number(limit)
  const [holidays, total] = await Promise.all([
    Holiday.find(query).skip(skip).limit(Number(limit)).sort({ startDate: 1 }),
    Holiday.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: holidays,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createHoliday = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const holiday = await Holiday.create({ ...req.body, institutionId })
  res.status(201).json({ success: true, data: holiday, message: 'Holiday created successfully' })
})

export const updateHoliday = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const holiday = await Holiday.findOneAndUpdate(
    { _id: id, institutionId: req.auth!.institutionId },
    req.body,
    { new: true }
  )
  if (!holiday) throw new AppError('Holiday not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: holiday, message: 'Holiday updated successfully' })
})

export const deleteHoliday = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const holiday = await Holiday.findOneAndDelete({ _id: id, institutionId: req.auth!.institutionId })
  if (!holiday) throw new AppError('Holiday not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: holiday, message: 'Holiday deleted successfully' })
})

// --- Events ---
export const getEvents = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const { page = 1, limit = 20, search, category, audience } = req.query

  const query: any = { institutionId }
  if (category) query.category = category
  if (audience) query.targetAudience = audience
  if (search) query.title = { $regex: String(search), $options: 'i' }

  const skip = (Number(page) - 1) * Number(limit)
  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .skip(skip)
      .limit(Number(limit))
      .sort({ startDate: 1 }),
    Event.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const event = await Event.create({ ...req.body, institutionId, organizer: req.auth!.userId })
  res.status(201).json({ success: true, data: event, message: 'Event scheduled successfully' })
})

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const event = await Event.findOneAndUpdate(
    { _id: id, institutionId: req.auth!.institutionId },
    req.body,
    { new: true }
  )
  if (!event) throw new AppError('Event not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: event, message: 'Event updated successfully' })
})

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const event = await Event.findOneAndDelete({ _id: id, institutionId: req.auth!.institutionId })
  if (!event) throw new AppError('Event not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: event, message: 'Event cancelled successfully' })
})
