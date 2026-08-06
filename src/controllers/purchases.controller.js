import { prisma } from '../prisma.js'
import { sanitizeString } from '../lib/route-helpers.js'
import { getNextPurchase } from '../utils/sequence.js'

export async function listPurchases(req, res) {
  res.json(await prisma.purchase.findMany({
    include: { supplier: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  }))
}

export async function createPurchase(req, res) {
  const { supplierId, items, total } = req.body
  if (!items?.length) return res.status(400).json({ error: 'Debe incluir al menos un producto' })

  const result = await prisma.$transaction(async (tx) => {
    const invoice = await getNextPurchase(prisma, tx)
    const purchase = await tx.purchase.create({
      data: {
        invoice, supplierId: supplierId || null, total,
        items: { create: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, subtotal: i.price * i.quantity })) },
      },
      include: { supplier: true, items: { include: { product: true } } },
    })
    for (const item of items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      await tx.inventoryMovement.create({ data: { productId: item.productId, type: 'entrada', quantity: item.quantity, reason: `Compra ${invoice}` } })
    }
    return purchase
  })
  res.json(result)
}

export async function updatePurchaseStatus(req, res) {
  const { status } = req.body
  if (!['pendiente', 'pagado'].includes(status)) return res.status(400).json({ error: 'Estado inválido' })
  res.json(await prisma.purchase.update({ where: { id: req.params.id }, data: { status } }))
}
