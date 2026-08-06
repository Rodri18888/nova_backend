import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'

export function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' })
    req.user = user; next()
  })
}

export function requireAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' })
  next()
}
