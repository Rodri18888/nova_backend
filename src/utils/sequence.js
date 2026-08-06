export async function getNextInvoice(prisma, tx) {
  const db = tx || prisma
  const last = await db.sale.findFirst({ orderBy: { createdAt: 'desc' }, select: { invoice: true } })
  if (last?.invoice) return `F-${String(parseInt(last.invoice.replace('F-', '')) + 1).padStart(6, '0')}`
  return 'F-000001'
}

export async function getNextDevolution(prisma, tx) {
  const db = tx || prisma
  const last = await db.devolution.findFirst({ orderBy: { createdAt: 'desc' }, select: { invoice: true } })
  const num = last?.invoice ? parseInt(last.invoice.replace('DEV-', '')) + 1 : 1
  return `DEV-${String(num).padStart(6, '0')}`
}

export async function getNextPurchase(prisma, tx) {
  const db = tx || prisma
  const last = await db.purchase.findFirst({ orderBy: { createdAt: 'desc' }, select: { invoice: true } })
  const num = last?.invoice ? parseInt(last.invoice.replace('COM-', '')) + 1 : 1
  return `COM-${String(num).padStart(6, '0')}`
}
