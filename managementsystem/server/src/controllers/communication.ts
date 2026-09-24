import type { Request, Response } from 'express'
import { Announcement } from '../models/Announcement.js'
import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'
import { Notification } from '../models/Notification.js'
import { AppError, asyncHandler } from '../utils/errors.js'

// --- Announcements ---
export const getAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const role = req.auth!.role
  const { page = 1, limit = 10, search, category, priority } = req.query

  const query: any = {
    institutionId,
    targetRoles: { $in: [role, 'all'] },
    isPublished: true,
  }
  if (category) query.category = category
  if (priority) query.priority = priority
  if (search) query.title = { $regex: String(search), $options: 'i' }

  // Super admins and principals can see unpublished announcements too
  if (['super_admin', 'principal'].includes(role)) {
    delete query.isPublished
    delete query.targetRoles
  }

  const skip = (Number(page) - 1) * Number(limit)
  const [announcements, total] = await Promise.all([
    Announcement.find(query)
      .populate('authorId', 'firstName lastName role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ publishDate: -1, createdAt: -1 }),
    Announcement.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: announcements,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const authorId = req.auth!.userId
  const announcement = await Announcement.create({
    ...req.body,
    institutionId,
    authorId,
    publishDate: req.body.publishDate || new Date(),
  })
  res.status(201).json({ success: true, data: announcement, message: 'Announcement created successfully' })
})

export const updateAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const announcement = await Announcement.findOneAndUpdate(
    { _id: id, institutionId: req.auth!.institutionId },
    req.body,
    { new: true }
  )
  if (!announcement) throw new AppError('Announcement not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: announcement, message: 'Announcement updated successfully' })
})

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const announcement = await Announcement.findOneAndDelete({ _id: id, institutionId: req.auth!.institutionId })
  if (!announcement) throw new AppError('Announcement not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: announcement, message: 'Announcement deleted successfully' })
})

// --- Conversations ---
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const userId = req.auth!.userId

  const conversations = await Conversation.find({
    institutionId,
    participants: userId,
  })
    .populate('participants', 'firstName lastName email role avatarUrl')
    .sort({ updatedAt: -1 })

  res.json({ success: true, data: conversations })
})

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const institutionId = req.auth!.institutionId
  const userId = req.auth!.userId
  const { participantIds = [], type = 'direct', title } = req.body

  const allParticipants = Array.from(new Set([userId, ...participantIds]))

  if (type === 'direct' && allParticipants.length === 2) {
    const existing = await Conversation.findOne({
      institutionId,
      type: 'direct',
      participants: { $all: allParticipants, $size: 2 },
    }).populate('participants', 'firstName lastName email role')
    if (existing) {
      return res.json({ success: true, data: existing })
    }
  }

  const conversation = await Conversation.create({
    institutionId,
    participants: allParticipants,
    type,
    title,
  })
  const populated = await Conversation.findById(conversation._id).populate('participants', 'firstName lastName email role')
  res.status(201).json({ success: true, data: populated, message: 'Conversation started' })
})

// --- Messages ---
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params
  const userId = req.auth!.userId
  const { page = 1, limit = 50 } = req.query

  const conv = await Conversation.findOne({ _id: conversationId, participants: userId })
  if (!conv) throw new AppError('Conversation not found or access denied', 404, 'NOT_FOUND')

  const skip = (Number(page) - 1) * Number(limit)
  const [messages, total] = await Promise.all([
    Message.find({ conversationId })
      .populate('senderId', 'firstName lastName email role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: 1 }),
    Message.countDocuments({ conversationId }),
  ])

  res.json({
    success: true,
    data: {
      items: messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversationId } = req.params
  const userId = req.auth!.userId
  const { content, text } = req.body
  const messageText = content || text

  if (!messageText?.trim()) throw new AppError('Message content cannot be empty', 400, 'EMPTY_MESSAGE')

  const conv = await Conversation.findOne({ _id: conversationId, participants: userId })
  if (!conv) throw new AppError('Conversation not found or access denied', 404, 'NOT_FOUND')

  const message = await Message.create({
    conversationId,
    senderId: userId,
    text: messageText,
    content: messageText,
  })

  conv.lastMessage = {
    text: messageText,
    senderId: userId as any,
    createdAt: new Date(),
  }
  await conv.save()

  const populated = await Message.findById(message._id).populate('senderId', 'firstName lastName email role')
  res.status(201).json({ success: true, data: populated, message: 'Message sent' })
})

// --- Notifications ---
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId
  const { page = 1, limit = 20, isRead } = req.query

  const query: any = { recipientId: userId }
  if (isRead !== undefined) query.isRead = isRead === 'true'

  const skip = (Number(page) - 1) * Number(limit)
  const [notifications, total] = await Promise.all([
    Notification.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Notification.countDocuments(query),
  ])

  res.json({
    success: true,
    data: {
      items: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    },
  })
})

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipientId: req.auth!.userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  )
  if (!notification) throw new AppError('Notification not found', 404, 'NOT_FOUND')
  res.json({ success: true, data: notification })
})

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ recipientId: req.auth!.userId, isRead: false }, { isRead: true, readAt: new Date() })
  res.json({ success: true, message: 'All notifications marked as read' })
})
