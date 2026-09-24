import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'

const app = express()
const port = Number(process.env.PORT || 4000)
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/educore_os'

app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    service: 'educore-api',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  })
})

async function startServer() {
  await mongoose.connect(mongoUri)
  app.listen(port, () => {
    console.log(`EduCore API listening on http://localhost:${port}`)
  })
}

async function stopServer() {
  await mongoose.disconnect()
  process.exit(0)
}

process.on('SIGINT', stopServer)
process.on('SIGTERM', stopServer)

startServer().catch((error) => {
  console.error('Unable to connect to MongoDB', error)
  process.exit(1)
})
