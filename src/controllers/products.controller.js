import { prisma } from '../prisma.js'
import { sanitizeString } from '../lib/route-helpers.js'

export async function listProducts(req, res) {
  res.json(await prisma.product.findMany({ orderBy: { createdAt: 'desc' } }))
}

export async function createProduct(req, res) {
  const { name, sku, price, cost, stock, size, color, material, type, description, barcode } = req.body
  if (!name || !sku || price == null) return res.status(400).json({ error: 'Nombre, SKU y precio requeridos' })
  res.json(await prisma.product.create({
    data: {
      name: sanitizeString(name), sku: sanitizeString(sku), price: parseFloat(price),
      cost: cost ? parseFloat(cost) : 0, stock: stock ? parseInt(stock) : 0,
      size: Array.isArray(size) ? size.map(s => sanitizeString(s)).filter(Boolean) : [],
      color: Array.isArray(color) ? color.map(c => sanitizeString(c)).filter(Boolean) : [],
      material: Array.isArray(material) ? material.map(m => sanitizeString(m)).filter(Boolean) : [],
      type: type ? sanitizeString(type) : null,
      description: description ? sanitizeString(description) : null,
      barcode: barcode ? sanitizeString(barcode) : null,
    },
  }))
}

export async function updateProduct(req, res) {
  const allowed = ['name', 'sku', 'price', 'cost', 'stock', 'size', 'color', 'material', 'type', 'description', 'barcode', 'minStock']
  const data = {}
  for (const key of allowed) if (req.body[key] !== undefined) data[key] = req.body[key]
  for (const key of ['name', 'sku', 'type', 'description', 'barcode']) {
    if (data[key] !== undefined && data[key] !== null) data[key] = sanitizeString(data[key])
  }
  for (const key of ['size', 'color', 'material']) {
    if (data[key] !== undefined) data[key] = (Array.isArray(data[key]) ? data[key] : []).map(v => sanitizeString(v)).filter(Boolean)
  }
  if (data.price !== undefined) data.price = parseFloat(data.price)
  if (data.cost !== undefined) data.cost = parseFloat(data.cost)
  if (data.stock !== undefined) data.stock = parseInt(data.stock)
  if (data.minStock !== undefined) data.minStock = parseInt(data.minStock)
  res.json(await prisma.product.update({ where: { id: req.params.id }, data }))
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
  res.json(await prisma.product.update({ where: { id: req.params.id }, data: { stock: parseInt(quantity) } }))
}
