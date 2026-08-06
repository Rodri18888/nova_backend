import { prisma } from '../prisma.js'
import { sanitizeString } from '../lib/route-helpers.js'

export async function listMovements(req, res) {
  res.json(await prisma.inventoryMovement.findMany({ include: { product: true }, orderBy: { createdAt: 'desc' } }))
}

export async function createMovement(req, res) {
  const { productId, type, quantity, reason } = req.body
  if (!productId || !type || !quantity || !reason) return res.status(400).json({ error: 'Todos los campos son requeridos' })
  if (!['entrada', 'salida'].includes(type)) return res.status(400).json({ error: 'Tipo inválido' })
  const result = await prisma.$transaction(async (tx) => {
    const movement = await tx.inventoryMovement.create({
      data: { productId, type, quantity: parseInt(quantity), reason: sanitizeString(reason) },
      include: { product: true },
    })
    await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: type === 'entrada' ? parseInt(quantity) : -parseInt(quantity) } },
    })
    return movement
  })
  res.json(result)
}
