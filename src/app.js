import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { isAllowedOrigin } from './config.js'
import { apiLimiter } from './middleware/rate-limit.js'
import { securityHeaders } from './middleware/security-headers.js'
import { errorHandler } from './middleware/error-handler.js'
import routes from './routes/index.js'

export function createApp() {
  const app = express()

  app.use(cors({
    origin: (origin, cb) => isAllowedOrigin(origin) ? cb(null, true) : cb(new Error('Origen no permitido')),
    credentials: true,
  }))
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(securityHeaders)
  app.use('/api/', apiLimiter)
  app.use('/api', routes)
  app.use(errorHandler)

  return app
}
