export const JWT_SECRET = process.env.JWT_SECRET
export const PORT = process.env.PORT || 3001
export const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:3000').split(',')
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || '',
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  pass: process.env.SMTP_PASS || '',
}
export const MAIL_FROM = process.env.MAIL_FROM || 'NOVA <no-reply@nova.com>'

export const RESET_TOKEN_EXPIRES_MINUTES = 60

export const STORE_CONFIG_FIELDS = ['name', 'rnc', 'phone', 'address', 'taxRate', 'slogan']
export const DEFAULT_STORE_CONFIG = { name: 'MODAPOS', rnc: '', phone: '', address: '', taxRate: 19, slogan: '' }
