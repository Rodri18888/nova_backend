import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'
import { prisma, runWithStore } from '../prisma.js'

export function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token requerido' })
  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado' })
    const attach = (user) => {
      if (!user?.storeId) return res.status(401).json({ error: 'Token sin tienda asignada' })
      req.user = user
      runWithStore(user.storeId, () => next())
    }
    if (decoded.storeId) return attach(decoded)
    prisma.user
      .findUnique({ where: { id: decoded.id }, select: { id: true, storeId: true } })
      .then((u) => attach({ ...decoded, storeId: u?.storeId }))
      .catch(() => attach({ ...decoded, storeId: undefined }))
  })
}

export function requireAdmin(req, res, next) {
  if (req.user?.rol !== 'admin') return res.status(403).json({ error: 'Acceso denegado' })
  next()
}