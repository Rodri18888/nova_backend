import { prisma } from '../prisma.js'
import { sanitizeString, pick } from '../lib/route-helpers.js'

export async function listCustomers(req, res) {
  const customers = await prisma.customer.findMany({
    include: { sales: { select: { total: true, createdAt: true }, orderBy: { createdAt: 'desc' } } },
    orderBy: { createdAt: 'desc' },
  })
  res.json(customers.map(c => ({
    id: c.id, name: c.name, email: c.email, phone: c.phone, address: c.address, points: c.points,
    purchases: c.sales.length, totalSpent: c.sales.reduce((sum, s) => sum + s.total, 0),
    lastPurchase: c.sales[0]?.createdAt?.toISOString() || c.createdAt.toISOString(),
    createdAt: c.createdAt.toISOString(),
  })))
}

export async function createCustomer(req, res) {
  const { name, email, phone, address } = req.body
  if (!name) return res.status(400).json({ error: 'Nombre requerido' })
  res.json(await prisma.customer.create({ data: { name: sanitizeString(name), email, phone, address } }))
}

export async function updateCustomer(req, res) {
  const data = pick(req.body, ['name', 'email', 'phone', 'address'])
  if (data.name) data.name = sanitizeString(data.name)
  res.json(await prisma.customer.update({ where: { id: req.params.id }, data }))
}

export async function deleteCustomer(req, res) {
  await prisma.sale.updateMany({ where: { customerId: req.params.id }, data: { customerId: null } })
  await prisma.customer.delete({ where: { id: req.params.id } })
  res.json({ success: true })
}
