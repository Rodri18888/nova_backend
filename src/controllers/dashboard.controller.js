import { prisma } from '../prisma.js'

export async function getStats(req, res) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

  const [salesToday, transactions, totalProducts, profitData, recentSales, topProducts, lowStock] = await Promise.all([
    prisma.sale.aggregate({ where: { createdAt: { gte: today, lt: tomorrow }, status: 'activa' }, _sum: { total: true } }),
    prisma.sale.count({ where: { createdAt: { gte: today, lt: tomorrow }, status: 'activa' } }),
    prisma.product.count(),
    prisma.sale.aggregate({ where: { createdAt: { gte: today, lt: tomorrow }, status: 'activa' }, _sum: { total: true, subtotal: true, tax: true, discount: true } }),
    prisma.sale.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { customer: true, items: true }, where: { status: 'activa' } }),
    prisma.saleItem.groupBy({ by: ['productId'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5, where: { sale: { status: 'activa' } } }),
    prisma.product.findMany({ where: { stock: { lte: 5 } }, orderBy: { stock: 'asc' }, take: 5 }),
  ])

  const topProductIds = topProducts.map(p => p.productId)
  const topProductData = topProductIds.length ? await prisma.product.findMany({ where: { id: { in: topProductIds } } }) : []

  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date(today)
    dayStart.setDate(dayStart.getDate() - i)
    const dayEnd = new Date(dayStart); dayEnd.setDate(dayEnd.getDate() + 1)
    const daySales = await prisma.sale.aggregate({ where: { createdAt: { gte: dayStart, lt: dayEnd }, status: 'activa' }, _sum: { total: true } })
    last7Days.push({ date: dayStart.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' }), total: daySales._sum.total || 0 })
  }

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  const monthSalesRaw = await prisma.sale.findMany({
    where: { createdAt: { gte: monthStart, lt: monthEnd }, status: 'activa' },
    select: { total: true, createdAt: true },
  })
  const currentMonth = []
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const dayTotal = monthSalesRaw
      .filter(s => s.createdAt.getDate() === d)
      .reduce((sum, s) => sum + Number(s.total), 0)
    currentMonth.push({
      date: `${d} ${new Date(today.getFullYear(), today.getMonth(), d).toLocaleDateString('es-CO', { month: 'short' })}`,
      total: dayTotal,
    })
  }

  const yearStart = new Date(today.getFullYear(), 0, 1)
  const yearEnd = new Date(today.getFullYear() + 1, 0, 1)
  const yearSalesRaw = await prisma.sale.findMany({
    where: { createdAt: { gte: yearStart, lt: yearEnd }, status: 'activa' },
    select: { total: true, createdAt: true },
  })
  const currentYear = []
  for (let m = 0; m < 12; m++) {
    const monthTotal = yearSalesRaw
      .filter(s => s.createdAt.getMonth() === m)
      .reduce((sum, s) => sum + Number(s.total), 0)
    currentYear.push({
      date: new Date(today.getFullYear(), m, 1).toLocaleDateString('es-CO', { month: 'short' }),
      total: monthTotal,
    })
  }

  res.json({
    salesToday: salesToday._sum.total || 0, transactions, products: totalProducts,
    netProfit: (profitData._sum.subtotal || 0) - (profitData._sum.tax || 0),
    weeklySales: last7Days,
    monthlySales: currentMonth,
    yearlySales: currentYear,
    recentSales: recentSales.map(s => ({ id: s.id, invoice: s.invoice, customer: s.customer?.name || 'Cliente general', items: s.items.length, total: s.total, time: s.createdAt.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) })),
    topProducts: topProducts.map(p => { const prod = topProductData.find(pd => pd.id === p.productId); return { name: prod?.name || 'N/A', sold: p._sum.quantity || 0 } }),
    lowStock: lowStock.map(p => ({ id: p.id, name: p.name, stock: p.stock, minStock: p.minStock })),
  })
}
