export const JWT_SECRET = process.env.JWT_SECRET
export const PORT = process.env.PORT || 3001
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
export const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://localhost:3000')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const REGEX_DEV_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

export function isAllowedOrigin(origin) {
  if (!origin) return true
  if (ALLOWED_ORIGINS.includes(origin)) return true
  return REGEX_DEV_ORIGIN.test(origin)
}
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'

export const EMAILJS_CONFIG = {
  serviceId: process.env.EMAILJS_SERVICE_ID || '',
  templateId: process.env.EMAILJS_TEMPLATE_ID || '',
  publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
  privateKey: process.env.EMAILJS_PRIVATE_KEY || '',
}

export const MAIL_FROM = process.env.MAIL_FROM || 'NOVA <no-reply@nova.com>'

export const RESET_TOKEN_EXPIRES_MINUTES = 60

export const STORE_CONFIG_FIELDS = ['name', 'rnc', 'phone', 'address', 'taxRate', 'slogan']
export const DEFAULT_STORE_CONFIG = { name: 'MODAPOS', rnc: '', phone: '', address: '', taxRate: 19, slogan: '' }
