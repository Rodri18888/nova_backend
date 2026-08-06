export const JWT_SECRET = process.env.JWT_SECRET
export const PORT = process.env.PORT || 3001
export const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:5174,http://localhost:3000').split(',')

export const STORE_CONFIG_FIELDS = ['name', 'rnc', 'phone', 'address', 'taxRate', 'slogan']
export const DEFAULT_STORE_CONFIG = { name: 'MODAPOS', rnc: '', phone: '', address: '', taxRate: 19, slogan: '' }
