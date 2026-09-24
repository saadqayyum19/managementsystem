import type { Server as SocketServer, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { Conversation } from '../models/Conversation.js'
import { Message } from '../models/Message.js'

interface AuthSocket extends Socket {
  userId?: string
  institutionId?: string
  role?: string
}

export function setupSocketHandlers(io: SocketServer) {
  // Auth middleware
  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token as string | undefined
    if (!token) return next(new Error('Authentication required'))
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as { sub: string; institutionId: string; role: string }
      socket.userId = payload.sub
      socket.institutionId = payload.institutionId
      socket.role = payload.role
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (rawSocket) => {
    const socket = rawSocket as AuthSocket
    const userId = socket.userId!
    const institutionId = socket.institutionId!

    // Join personal room + institution room
    socket.join(`user:${userId}`)
    socket.join(`institution:${institutionId}`)

    // Join conversation rooms
    socket.on('join:conversation', async (conversationId: string) => {
      try {
        const conv = await Conversation.findOne({ _id: conversationId, participants: userId })
        if (conv) socket.join(`conversation:${conversationId}`)
      } catch { /* ignore */ }
    })

    socket.on('leave:conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`)
    })

    // Send message
    socket.on('message:send', async (data: { conversationId: string; content: string }) => {
      try {
        const conv = await Conversation.findOne({ _id: data.conversationId, participants: userId })
        if (!conv) return
        const message = await Message.create({
          institutionId,
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
        })
        conv.lastMessage = {
          text: data.content,
          senderId: userId as any,
          createdAt: new Date(),
        }
        await conv.save()
        const populated = await Message.findById(message._id).populate('senderId', 'firstName lastName avatarUrl').lean()
        io.to(`conversation:${data.conversationId}`).emit('message:new', populated)
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Typing indicators
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', { userId, conversationId })
    })
    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', { userId, conversationId })
    })

    // Notifications
    socket.on('notification:read', (notificationId: string) => {
      socket.emit('notification:updated', { id: notificationId, read: true })
    })

    socket.on('disconnect', () => {
      // Cleanup handled automatically by Socket.io
    })
  })
}

// Helper to emit to specific user from controllers
export function emitToUser(io: SocketServer, userId: string, event: string, data: unknown) {
  io.to(`user:${userId}`).emit(event, data)
}

export function emitToInstitution(io: SocketServer, institutionId: string, event: string, data: unknown) {
  io.to(`institution:${institutionId}`).emit(event, data)
}
