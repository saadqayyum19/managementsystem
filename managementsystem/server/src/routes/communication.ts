import { Router } from 'express'
import { authenticate, requireRoles } from '../middleware/auth.js'
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/communication.js'

export const communicationRouter = Router()

communicationRouter.use(authenticate)

// Announcements
communicationRouter.get('/announcements', getAnnouncements)
communicationRouter.post('/announcements', requireRoles('super_admin', 'principal', 'teacher'), createAnnouncement)
communicationRouter.put('/announcements/:id', requireRoles('super_admin', 'principal', 'teacher'), updateAnnouncement)
communicationRouter.delete('/announcements/:id', requireRoles('super_admin', 'principal'), deleteAnnouncement)

// Conversations & Messages
communicationRouter.get('/conversations', getConversations)
communicationRouter.post('/conversations', createConversation)
communicationRouter.get('/conversations/:conversationId/messages', getMessages)
communicationRouter.post('/conversations/:conversationId/messages', sendMessage)

// Notifications
communicationRouter.get('/notifications', getNotifications)
communicationRouter.patch('/notifications/:id/read', markNotificationRead)
communicationRouter.post('/notifications/read-all', markAllNotificationsRead)
