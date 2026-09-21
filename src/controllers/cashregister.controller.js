import { prisma } from '../prisma.js'
import { sanitizeString } from '../lib/route-helpers.js'

const MAX_AMOUNT = 1e10

function parseAmount(value) {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isFinite(n) && n >= 0 && n < MAX_AMOUNT ? n : null
}

export async function getCurrent(req, res) {
  res.json(await prisma.cashRegister.findFirst({
    where: { status: 'abierta' },
    include: { movements: { include: { user: true } }, user: true },
    orderBy: { createdAt: 'desc' },
  }))
}

export async function getHistory(req, res) {
  res.json(await prisma.cashRegister.findMany({
    include: { user: true, movements: true },
    orderBy: { createdAt: 'desc' },
  }))
}

export async function openRegister(req, res) {
  const initialAmount = parseAmount(req.body.initialAmount)
  if (initialAmount === null) return res.status(400).json({ error: 'Monto inicial inválido (debe ser un número entre 0 y 9,999,999,999.99)' })
  res.json(await prisma.cashRegister.create({
    data: { initialAmount, userId: req.user.id, expectedAmount: initialAmount, status: 'abierta' },
    include: { user: true },
  }))
}

export async function closeRegister(req, res) {
  const realAmount = parseAmount(req.body.realAmount)
  if (realAmount === null) return res.status(400).json({ error: 'Monto real inválido (debe ser un número entre 0 y 9,999,999,999.99)' })
  const current = await prisma.cashRegister.findFirst({ where: { status: 'abierta' }, orderBy: { createdAt: 'desc' } })
  if (!current) return res.status(400).json({ error: 'No hay caja abierta' })
  const sales = await prisma.sale.aggregate({ where: { status: 'activa', createdAt: { gte: current.openDate } }, _sum: { total: true } })
  const returns = await prisma.devolution.aggregate({ where: { createdAt: { gte: current.openDate } }, _sum: { total: true } })
  const expectedAmount = Number(current.initialAmount) + Number(sales._sum.total || 0) - Number(returns._sum.total || 0)
  if (expectedAmount < 0 || expectedAmount >= MAX_AMOUNT) return res.status(400).json({ error: 'El monto esperado excede el límite permitido' })
  res.json(await prisma.cashRegister.update({
    where: { id: current.id },
    data: {
      closeDate: new Date(), userId: req.user.id,
      expectedAmount,
      totalSales: sales._sum.total || 0, totalReturns: returns._sum.total || 0,
      realAmount, status: 'cerrada',
    },
    include: { user: true },
  }))
}

export async function createMovement(req, res) {
  const { type, reason } = req.body
  const amount = parseAmount(req.body.amount)
  if (!['entrada', 'salida'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' })
  if (amount === null || amount <= 0 || !reason) return res.status(400).json({ error: 'Monto (hasta 9,999,999,999.99) y motivo requeridos' })
  const current = await prisma.cashRegister.findFirst({ where: { status: 'abierta' }, orderBy: { createdAt: 'desc' } })
  if (!current) return res.status(400).json({ error: 'No hay caja abierta' })
  res.json(await prisma.cashMovement.create({
    data: { cashRegisterId: current.id, type, amount, reason: sanitizeString(reason), userId: req.user.id },
    include: { user: true },
  }))
}
