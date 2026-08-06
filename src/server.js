import 'dotenv/config'
import { createApp } from './app.js'
import { PORT, JWT_SECRET } from './config.js'
import { prisma } from './prisma.js'

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET no está definido.')
  process.exit(1)
}

const app = createApp()

app.listen(PORT, () => console.log(`Servidor API corriendo en puerto ${PORT}`))

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
