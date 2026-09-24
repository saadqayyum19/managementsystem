import { createServer } from 'node:http'
import { Server as SocketServer } from 'socket.io'
import { createApp } from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { setupSocketHandlers } from './sockets/chat.js'

export let io: SocketServer

async function start() {
  await connectDatabase()
  const app = createApp()
  const server = createServer(app)

  io = new SocketServer(server, {
    cors: { origin: env.CLIENT_URL, credentials: true },
    pingInterval: 25000,
    pingTimeout: 20000,
  })
  setupSocketHandlers(io)

  server.listen(env.PORT, () => console.log(`EduCore API listening on http://localhost:${env.PORT}`))
  const shutdown = async () => { server.close(); process.exit(0) }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((error) => { console.error('Unable to start EduCore API', error); process.exit(1) })
