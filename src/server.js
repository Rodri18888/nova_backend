import 'dotenv/config'
import { createApp } from './app.js'
import { PORT, JWT_SECRET } from './config.js'
import { prisma } from './prisma.js'
import logger from './utils/logger.js'

if (!JWT_SECRET) {
  logger.error('FATAL: JWT_SECRET no está definido.')
  process.exit(1)
}

const app = createApp()

app.listen(PORT, () => logger.info(`Servidor API corriendo en puerto ${PORT}`))

process.on('unhandledRejection', (err) =>
  logger.error('unhandledRejection:', { stack: err?.stack || err }),
)
process.on('uncaughtException', (err) =>
  logger.error('uncaughtException:', { stack: err?.stack || err }),
)

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
