import { prisma } from '../prisma.js'
import { sanitizeString } from '../lib/route-helpers.js'

export async function listProducts(req, res) {
  res.json(await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }))
}

export async function createProduct(req, res) {
  const { name, sku, price, cost, stock, categoryId, size, color, description, barcode } = req.body
  if (!name || !sku || price == null) return res.status(400).json({ error: 'Nombre, SKU y precio requeridos' })
  res.json(await prisma.product.create({
    data: {
      name: sanitizeString(name), sku: sanitizeString(sku), price: parseFloat(price),
      cost: cost ? parseFloat(cost) : 0, stock: stock ? parseInt(stock) : 0,
      categoryId, size: size ? sanitizeString(size) : null,
      color: color ? sanitizeString(color) : null,
      description: description ? sanitizeString(description) : null,
      barcode: barcode ? sanitizeString(barcode) : null,
    },
    include: { category: true },
  }))
}

export async function updateProduct(req, res) {
  const allowed = ['name', 'sku', 'price', 'cost', 'stock', 'categoryId', 'size', 'color', 'description', 'barcode', 'minStock']
  const data = {}
  for (const key of allowed) if (req.body[key] !== undefined) data[key] = req.body[key]
  for (const key of ['name', 'sku', 'size', 'color', 'description', 'barcode']) {
    if (data[key] !== undefined && data[key] !== null) data[key] = sanitizeString(data[key])
  }
  if (data.price !== undefined) data.price = parseFloat(data.price)
  if (data.cost !== undefined) data.cost = parseFloat(data.cost)
  if (data.stock !== undefined) data.stock = parseInt(data.stock)
  if (data.minStock !== undefined) data.minStock = parseInt(data.minStock)
  res.json(await prisma.product.update({ where: { id: req.params.id }, data, include: { category: true } }))
}

export async function deleteProduct(req, res) {
  await prisma.saleItem.deleteMany({ where: { productId: req.params.id } })
  await prisma.devolutionItem.deleteMany({ where: { productId: req.params.id } })
  await prisma.purchaseItem.deleteMany({ where: { productId: req.params.id } })
  await prisma.inventoryMovement.deleteMany({ where: { productId: req.params.id } })
  await prisma.product.delete({ where: { id: req.params.id } })
  res.json({ success: true })
}

export async function updateStock(req, res) {
  const { quantity } = req.body
  if (quantity == null || quantity < 0) return res.status(400).json({ error: 'Cantidad inválida' })
  res.json(await prisma.product.update({ where: { id: req.params.id }, data: { stock: parseInt(quantity) }, include: { category: true } }))
}
