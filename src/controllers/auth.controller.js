import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { prisma } from '../prisma.js'
import { JWT_SECRET, FRONTEND_URL, RESET_TOKEN_EXPIRES_MINUTES } from '../config.js'
import { sendResetPasswordEmail } from '../utils/mailer.js'

export async function login(req, res) {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' })
  const user = await prisma.user.findUnique({ where: { username: String(username) } })
  if (!user || !user.activo) return res.status(401).json({ error: 'Credenciales inválidas' })
  if (!await bcrypt.compare(String(password), user.password)) return res.status(401).json({ error: 'Credenciales inválidas' })
  const token = jwt.sign({ id: user.id, username: user.username, nombre: user.nombre, email: user.email, rol: user.rol }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '8h' })
  res.json({ token, user: { id: user.id, username: user.username, nombre: user.nombre, email: user.email, rol: user.rol } })
}

export async function register(req, res) {
  const { username, password, email, nombre } = req.body
  if (!username || !password || !email || !nombre)
    return res.status(400).json({ error: 'Nombre, usuario, email y contraseña son requeridos' })
  if (String(password).length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

  const existe = await prisma.user.findFirst({
      where: {
        OR: [
          { username: String(username) },
          { email: String(email) }
        ]
      }
    })

    if (existe) {
      return res.status(400).json({ error: 'El usuario o email ya existe' })
    }

  const hash = await bcrypt.hash(String(password), 10)
  const user = await prisma.user.create({
    data: { username: String(username), password: hash, nombre: String(nombre), email: String(email), rol: 'vendedor' },
  })
  const token = jwt.sign({ id: user.id, username: user.username, nombre: user.nombre, email: user.email, rol: user.rol }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '8h' })
  res.status(201).json({ token, user: { id: user.id, username: user.username, nombre: user.nombre, email: user.email, rol: user.rol } })
}

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

export async function forgotPassword(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'El email es requerido' })

  const genericMessage = { message: 'Si el correo existe, te enviamos un enlace para restablecer tu contraseña' }

  try {
    const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase().trim() } })
    if (!user || !user.activo) return res.json(genericMessage)

    const token = crypto.randomBytes(32).toString('hex')
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashToken(token),
        resetPasswordExpires: new Date(Date.now() + RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000),
      },
    })

    const resetLink = `${FRONTEND_URL}/reset-password/${token}`
    await sendResetPasswordEmail(user.email, user.nombre, resetLink)
    res.json(genericMessage)
  } catch (err) {
    console.error('Error en forgotPassword:', err)
    res.status(500).json({ error: 'No se pudo procesar la solicitud' })
  }
}

export async function resetPassword(req, res) {
  const { token, newPassword } = req.body
  if (!token || !newPassword) return res.status(400).json({ error: 'Token y nueva contraseña son requeridos' })
  if (String(newPassword).length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashToken(String(token)),
        resetPasswordExpires: { gt: new Date() },
      },
    })
    if (!user) return res.status(400).json({ error: 'El enlace es inválido o ha expirado' })

    const hash = await bcrypt.hash(String(newPassword), 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hash, resetPasswordToken: null, resetPasswordExpires: null },
    })
    res.json({ message: 'Contraseña actualizada correctamente' })
  } catch (err) {
    console.error('Error en resetPassword:', err)
    res.status(500).json({ error: 'No se pudo restablecer la contraseña' })
  }
}