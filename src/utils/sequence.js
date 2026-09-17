import { storeContext } from '../prisma.js'

const PREFIX = { sale: 'F-', devolution: 'DEV-', purchase: 'COM-' }

async function lockInvoiceIssue(db, scope) {
  const storeId = storeContext.getStore() || 'shared'
  await db.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${scope + ':' + storeId}))`
}

function parseInvoiceNumber(invoice) {
  const m = /(\d+)$/.exec(invoice)
  return m ? Number(m[1]) : null
}

function nextInvoice(rows, prefix) {
  let max = 0
  for (const r of rows) {
    const n = parseInvoiceNumber(r.invoice)
    if (n !== null && n > max) max = n
  }
  return `${prefix}${String(max + 1).padStart(6, '0')}`
}

export async function getNextInvoice(prisma, tx) {
  const db = tx || prisma
  await lockInvoiceIssue(db, 'sale')
  const rows = await db.sale.findMany({ select: { invoice: true } })
  return nextInvoice(rows, PREFIX.sale)
}

export async function getNextDevolution(prisma, tx) {
  const db = tx || prisma
  await lockInvoiceIssue(db, 'devolution')
  const rows = await db.devolution.findMany({ select: { invoice: true } })
  return nextInvoice(rows, PREFIX.devolution)
}

export async function getNextPurchase(prisma, tx) {
  const db = tx || prisma
  await lockInvoiceIssue(db, 'purchase')
  const rows = await db.purchase.findMany({ select: { invoice: true } })
  return nextInvoice(rows, PREFIX.purchase)
}