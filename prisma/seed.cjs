const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Sembrando base de datos en Neon...')

  // 1. Crear o buscar la Tienda por defecto
  const defaultStore = await prisma.store.upsert({
    where: { code: 'STORE-001' },
    update: {},
    create: {
      code: 'STORE-001',
      name: 'Tienda Principal',
    },
  })

  console.log('Tienda vinculada:', defaultStore.name)

  // 2. Usuarios
  const adminPass = await bcrypt.hash('admin123', 10)
  const vendedorPass = await bcrypt.hash('vendedor123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { 
      username: 'admin', 
      email: 'admin@tienda.com', 
      password: adminPass, 
      nombre: 'Administrador', 
      rol: 'admin',
      storeId: defaultStore.id,
    },
  })

  const vendedor = await prisma.user.upsert({
    where: { username: 'vendedor' },
    update: {},
    create: { 
      username: 'vendedor', 
      email: 'vendedor@tienda.com', 
      password: vendedorPass, 
      nombre: 'Juan Vendedor', 
      rol: 'vendedor',
      storeId: defaultStore.id,
    },
  })

  console.log('Usuarios creados:', admin.username, vendedor.username)

  // 3. Productos
  const products = [
    { name: 'Jeans Clásicos', sku: 'JEAN-001', price: 89900, cost: 42000, stock: 45, size: ['M'], color: ['Azul'], material: ['Algodón', 'Mezclilla'], type: 'Ropa' },
    { name: 'Jeans Skinny', sku: 'JEAN-002', price: 95000, cost: 45000, stock: 30, size: ['S'], color: ['Negro'], material: ['Algodón', 'Mezclilla'], type: 'Ropa' },
    { name: 'Pantalón Cargo', sku: 'PANT-001', price: 75000, cost: 35000, stock: 3, size: ['M'], color: ['Verde'], material: ['Algodón', 'Poliéster'], type: 'Ropa' },
    { name: 'Camiseta Básica', sku: 'CAMI-001', price: 35000, cost: 15000, stock: 120, size: ['S'], color: ['Blanco'], material: ['Algodón'], type: 'Ropa' },
    { name: 'Camisa Formal', sku: 'CAMI-002', price: 120000, cost: 55000, stock: 25, size: ['L'], color: ['Azul'], material: ['Algodón'], type: 'Ropa' },
    { name: 'Blusa Seda', sku: 'BLUS-001', price: 78000, cost: 35000, stock: 18, size: ['S'], color: ['Beige'], material: ['Seda'], type: 'Ropa' },
    { name: 'Chaqueta Denim', sku: 'CHAQ-001', price: 185000, cost: 90000, stock: 8, size: ['L'], color: ['Azul'], material: ['Mezclilla'], type: 'Ropa' },
    { name: 'Chaqueta Cuero', sku: 'CHAQ-002', price: 350000, cost: 170000, stock: 12, size: ['M'], color: ['Negro'], material: ['Cuero'], type: 'Ropa' },
    { name: 'Vestido Floral', sku: 'VEST-001', price: 95000, cost: 45000, stock: 28, size: ['M'], color: ['Rosa'], material: ['Algodón'], type: 'Ropa' },
    { name: 'Vestido Noche', sku: 'VEST-002', price: 250000, cost: 120000, stock: 10, size: ['S'], color: ['Negro'], material: ['Satén'], type: 'Ropa' },
    { name: 'Falda Plisada', sku: 'FALD-001', price: 65000, cost: 30000, stock: 5, size: ['S'], color: ['Negro'], material: ['Poliéster'], type: 'Ropa' },
    { name: 'Sudadera Hoodie', sku: 'SUDA-001', price: 120000, cost: 55000, stock: 42, size: ['L'], color: ['Gris'], material: ['Algodón'], type: 'Ropa' },
    { name: 'Sudadera Crop', sku: 'SUDA-002', price: 95000, cost: 45000, stock: 35, size: ['S'], color: ['Rosa'], material: ['Algodón'], type: 'Ropa' },
    { name: 'Cinturón Cuero', sku: 'CINT-001', price: 55000, cost: 25000, stock: 50, size: ['Única'], color: ['Marrón'], material: ['Cuero'], type: 'Accesorio' },
    { name: 'Gafas Sol', sku: 'GAFAS-001', price: 75000, cost: 35000, stock: 20, size: ['Única'], color: ['Negro'], material: ['Plástico'], type: 'Accesorio' },
    { name: 'Shorts Deportivos', sku: 'SHRT-001', price: 55000, cost: 25000, stock: 30, size: ['M'], color: ['Negro'], material: ['Poliéster'], type: 'Ropa' },
    { name: 'Shorts Mezclilla', sku: 'SHRT-002', price: 68000, cost: 32000, stock: 22, size: ['S'], color: ['Azul'], material: ['Mezclilla'], type: 'Ropa' },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        size: p.size,
        color: p.color,
        material: p.material,
        type: p.type,
        storeId: defaultStore.id,
      },
    })
  }

  console.log(`${products.length} productos creados`)

  // 5. Clientes
  const customers = [
    { name: 'María García', email: 'maria@email.com', phone: '310-555-0101' },
    { name: 'Juan Pérez', email: 'juan@email.com', phone: '315-555-0102' },
    { name: 'Ana López', email: 'ana@email.com', phone: '320-555-0103' },
    { name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '301-555-0104' },
    { name: 'Laura Martínez', email: 'laura@email.com', phone: '312-555-0105' },
  ]

  const customerRecords = []
  for (const c of customers) {
    const record = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: {
        ...c,
        storeId: defaultStore.id,
      },
    })
    customerRecords.push(record)
  }

  console.log(`${customers.length} clientes creados`)

  // 6. Proveedores
  const suppliers = [
    { name: 'Distribuidora Moda Total', contact: 'Pedro Sánchez', phone: '310-555-0201', email: 'pedro@modatotal.com' },
    { name: 'Importadora Textil SA', contact: 'Rosa Jiménez', phone: '315-555-0202', email: 'rosa@textilsa.com' },
    { name: 'Mayorista Fashion', contact: 'Miguel Torres', phone: '320-555-0203', email: 'miguel@fashion.com' },
  ]

  for (const s of suppliers) {
    await prisma.supplier.upsert({
      where: { email: s.email }, 
      update: {},
      create: {
        ...s,
        storeId: defaultStore.id,
      },
    }).catch(() => prisma.supplier.create({ data: { ...s, storeId: defaultStore.id } }))
  }

  console.log(`${suppliers.length} proveedores creados`)

  // Obtener mapeo de productos
  const allProducts = await prisma.product.findMany()
  const productMap = {}
  for (const p of allProducts) {
    productMap[p.sku] = p
  }

  // Limpiar datos antiguos de ventas
  const existingSalesCount = await prisma.sale.count()
  if (existingSalesCount > 0) {
    console.log(`Eliminando ${existingSalesCount} ventas existentes para re-sembrar...`)
    await prisma.devolutionItem.deleteMany()
    await prisma.devolution.deleteMany()
    await prisma.saleItem.deleteMany()
    await prisma.sale.deleteMany()
  }

  // 7. Ventas de los últimos 7 días
  const now = new Date()
  const TAX_RATE = 0.19

  const dailySales = [
    {
      dayOffset: 6,
      sales: [
        { items: [{ sku: 'CAMI-001', qty: 2 }], customerIdx: 0, user: vendedor, payment: 'efectivo' },
      ],
    },
    {
      dayOffset: 5,
      sales: [
        { items: [{ sku: 'CHAQ-001', qty: 1 }], customerIdx: 1, user: admin, payment: 'tarjeta' },
      ],
    },
    {
      dayOffset: 4,
      sales: [
        { items: [{ sku: 'CAMI-001', qty: 1 }, { sku: 'CINT-001', qty: 1 }], customerIdx: 2, user: vendedor, payment: 'efectivo' },
      ],
    },
    {
      dayOffset: 3,
      sales: [
        { items: [{ sku: 'VEST-002', qty: 1 }], customerIdx: 0, user: admin, payment: 'transferencia' },
      ],
    },
    {
      dayOffset: 2,
      sales: [
        { items: [{ sku: 'SUDA-001', qty: 1 }, { sku: 'SHRT-001', qty: 1 }], customerIdx: 3, user: vendedor, payment: 'tarjeta' },
      ],
    },
    {
      dayOffset: 1,
      sales: [
        { items: [{ sku: 'CHAQ-002', qty: 1 }], customerIdx: 4, user: admin, payment: 'efectivo' },
      ],
    },
    {
      dayOffset: 0,
      sales: [
        { items: [{ sku: 'VEST-001', qty: 1 }, { sku: 'FALD-001', qty: 1 }], customerIdx: 1, user: vendedor, payment: 'tarjeta' },
        { items: [{ sku: 'JEAN-002', qty: 1 }, { sku: 'BLUS-001', qty: 1 }], customerIdx: 2, user: admin, payment: 'efectivo' },
      ],
    },
  ]

  let saleCount = 0
  let invoiceNum = 1001

  for (const day of dailySales) {
    const saleDate = new Date(now)
    saleDate.setDate(saleDate.getDate() - day.dayOffset)
    saleDate.setHours(10 + (saleCount % 8), (saleCount * 37) % 60, 0, 0)

    for (const s of day.sales) {
      const invoice = `INV-${invoiceNum}`
      invoiceNum++
      saleCount++

      let itemSubtotal = 0
      const saleItemsData = []

      for (const item of s.items) {
        const product = productMap[item.sku]
        const priceNum = Number(product.price)
        const linePrice = priceNum * item.qty
        const lineDiscount = 0
        const lineSubtotal = linePrice - lineDiscount
        itemSubtotal += lineSubtotal

        saleItemsData.push({
          quantity: item.qty,
          price: priceNum,
          discount: lineDiscount,
          subtotal: lineSubtotal,
          productId: product.id,
          storeId: defaultStore.id, // <-- Asignado a SaleItem
        })
      }

      const tax = Math.round(itemSubtotal * TAX_RATE)
      const discount = 0
      const total = itemSubtotal + tax - discount

      await prisma.sale.create({
        data: {
          invoice,
          total,
          subtotal: itemSubtotal,
          tax,
          discount,
          paymentMethod: s.payment,
          customerId: customerRecords[s.customerIdx].id,
          userId: s.user.id,
          storeId: defaultStore.id, // <-- Asignado a Sale
          status: 'activa',
          createdAt: saleDate,
          items: {
            create: saleItemsData,
          },
        },
      })

      console.log(`  Venta ${invoice}: $${total.toLocaleString()} COP (${saleDate.toISOString().slice(0, 10)})`)
    }
  }

  console.log(`${saleCount} ventas creadas para los últimos 7 días`)
  console.log('¡Base de datos en Neon sembrada con éxito!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })