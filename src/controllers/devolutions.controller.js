import { prisma } from '../prisma.js'
import { sanitizeString } from '../lib/route-helpers.js'
import { getNextDevolution } from '../utils/sequence.js'

export async function listDevolutions(req, res) {
  res.json(await prisma.devolution.findMany({
    include: { sale: true, user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  }))
}

export async function createDevolution(req, res) {
  const { saleId, motivo, items, total } = req.body
  if (!saleId || !motivo || !items?.length) return res.status(400).json({ error: 'Datos incompletos' })

  const result = await prisma.$transaction(async (tx) => {
    const invoice = await getNextDevolution(prisma, tx)
    const dev = await tx.devolution.create({
      data: {
        invoice, saleId, userId: req.user.id, motivo: sanitizeString(motivo), total,
        items: { create: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, subtotal: i.price * i.quantity, motivo: sanitizeString(i.motivo || motivo) })) },
      },
      include: { sale: true, items: { include: { product: true } } },
    })
    for (const item of items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      await tx.inventoryMovement.create({ data: { productId: item.productId, type: 'entrada', quantity: item.quantity, reason: `Devolución ${invoice}` } })
    }
    return dev
  })
  res.json(result)
}
