import bcrypt from 'bcryptjs'
import { prisma } from '../prisma.js'
import { sanitizeString, pick } from '../lib/route-helpers.js'

export async function listUsers(req, res) {
  res.json(await prisma.user.findMany({
    select: { id: true, username: true, nombre: true, email: true, rol: true, activo: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  }))
}

export async function createUser(req, res) {
  const { username, password, email, nombre, rol, storeId } = req.body
  if (!username || !password || !email || !nombre) return res.status(400).json({ error: 'Usuario, email, contraseña y nombre requeridos' })
  if (String(password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  if (!['admin', 'vendedor'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' })
  const hash = await bcrypt.hash(String(password), 10)
  res.json(await prisma.user.create({
    data: { username: String(username), password: hash, email: String(email), nombre: sanitizeString(nombre), rol: rol || 'vendedor', storeId },
    select: { id: true, username: true, nombre: true, email: true, rol: true, activo: true, storeId: true },
  }))
}

export async function updateUser(req, res) {
  const data = pick(req.body, ['nombre', 'rol', 'activo', 'password'])
  if (data.rol && !['admin', 'vendedor'].includes(data.rol)) return res.status(400).json({ error: 'Rol inválido' })
  if (data.password) {
    if (String(data.password).length < 6) return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
    data.password = await bcrypt.hash(String(data.password), 10)
  } else delete data.password
  if (data.nombre) data.nombre = sanitizeString(data.nombre)
  res.json(await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, username: true, nombre: true, rol: true, activo: true },
  }))
}

export async function deleteUser(req, res) {
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' })
  await prisma.user.delete({ where: { id: req.params.id } })
  res.json({ success: true })
}
