import { prisma } from '../prisma.js'
import { sanitizeString } from '../lib/route-helpers.js'

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
  const { initialAmount } = req.body
  if (initialAmount == null || initialAmount < 0) return res.status(400).json({ error: 'Monto inicial inválido' })
  res.json(await prisma.cashRegister.create({
    data: { initialAmount: parseFloat(initialAmount), userId: req.user.id, expectedAmount: parseFloat(initialAmount), status: 'abierta' },
    include: { user: true },
  }))
}

export async function closeRegister(req, res) {
  const { realAmount } = req.body
  if (realAmount == null) return res.status(400).json({ error: 'Monto real requerido' })
  const current = await prisma.cashRegister.findFirst({ where: { status: 'abierta' }, orderBy: { createdAt: 'desc' } })
  if (!current) return res.status(400).json({ error: 'No hay caja abierta' })
  const sales = await prisma.sale.aggregate({ where: { status: 'activa', createdAt: { gte: current.openDate } }, _sum: { total: true } })
  const returns = await prisma.devolution.aggregate({ where: { createdAt: { gte: current.openDate } }, _sum: { total: true } })
  res.json(await prisma.cashRegister.update({
    where: { id: current.id },
    data: {
      closeDate: new Date(), userId: req.user.id,
      expectedAmount: current.initialAmount + (sales._sum.total || 0) - (returns._sum.total || 0),
      totalSales: sales._sum.total || 0, totalReturns: returns._sum.total || 0,
      realAmount: parseFloat(realAmount), status: 'cerrada',
    },
    include: { user: true },
  }))
}

export async function createMovement(req, res) {
  const { type, amount, reason } = req.body
  if (!type || amount == null || !reason) return res.status(400).json({ error: 'Tipo, monto y motivo requeridos' })
  if (!['entrada', 'salida'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' })
  const current = await prisma.cashRegister.findFirst({ where: { status: 'abierta' }, orderBy: { createdAt: 'desc' } })
  if (!current) return res.status(400).json({ error: 'No hay caja abierta' })
  res.json(await prisma.cashMovement.create({
    data: { cashRegisterId: current.id, type, amount: parseFloat(amount), reason: sanitizeString(reason), userId: req.user.id },
    include: { user: true },
  }))
}
