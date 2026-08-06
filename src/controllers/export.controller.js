import { prisma } from '../prisma.js'
import { sanitizeCsvField } from '../utils/csv.js'

export async function exportSales(req, res) {
  const sales = await prisma.sale.findMany({
    include: { customer: true, user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  })
  const csv = ['Factura,Fecha,Cliente,Vendedor,Pago,Subtotal,Descuento,IVA,Total,Estado,Artículos']
  sales.forEach(s => csv.push([s.invoice, s.createdAt.toISOString(), s.customer?.name || '', s.user?.nombre || '', s.paymentMethod, s.subtotal, s.discount, s.tax, s.total, s.status, s.items.length].map(sanitizeCsvField).join(',')))
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=ventas.csv')
  res.send(csv.join('\n'))
}

export async function exportProducts(req, res) {
  const products = await prisma.product.findMany({ include: { category: true } })
  const csv = ['Nombre,SKU,Código Barras,Categoría,Precio,Costo,Stock,Talla,Color,Descripción']
  products.forEach(p => csv.push([p.name, p.sku, p.barcode || '', p.category?.name || '', p.price, p.cost, p.stock, p.size || '', p.color || '', p.description || ''].map(sanitizeCsvField).join(',')))
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=productos.csv')
  res.send(csv.join('\n'))
}
