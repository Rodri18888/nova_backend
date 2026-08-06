import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma.js'
import { JWT_SECRET } from '../config.js'

export async function login(req, res) {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  const user = await prisma.user.findUnique({ where: { username: String(username) } })
  if (!user || !user.activo) return res.status(401).json({ error: 'Credenciales inválidas' })
  if (!await bcrypt.compare(String(password), user.password)) return res.status(401).json({ error: 'Credenciales inválidas' })
  const token = jwt.sign({ id: user.id, username: user.username, nombre: user.nombre, rol: user.rol }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '8h' })
  res.json({ token, user: { id: user.id, username: user.username, nombre: user.nombre, rol: user.rol } })
}
