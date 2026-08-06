import express from 'express'
import cors from 'cors'
import { ALLOWED_ORIGINS } from './config.js'
import { apiLimiter } from './middleware/rate-limit.js'
import { securityHeaders } from './middleware/security-headers.js'
import { errorHandler } from './middleware/error-handler.js'
import routes from './routes/index.js'

export function createApp() {
  const app = express()

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) cb(null, true)
      else cb(new Error('Origen no permitido'))
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(securityHeaders)
  app.use('/api/', apiLimiter)
  app.use('/api', routes)
  app.use(errorHandler)

  return app
}
