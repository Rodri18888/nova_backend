const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { randomUUID } = require('crypto')

const prisma = new PrismaClient()

const TAX_RATE = 0.19
const DAYS = 1095
const SALE_CHUNK = 500

const now = new Date()

const storesConfig = [
  {
    code: 'ROPA-001',
    name: 'Moda Nova - Ropa',
    admin: { username: 'admin', email: 'admin@tienda.com', nombre: 'Administrador Principal' },
    sellers: [
      { username: 'vendedor', email: 'vendedor@tienda.com', nombre: 'Juan Vendedor' },
      { username: 'ropa_lucia', email: 'lucia@modanova.com', nombre: 'Lucía Martínez' },
    ],
    daily: { min: 1, max: 4, weekendExtra: 2 },
    customers: [
      'María García', 'Juan Pérez', 'Ana López', 'Carlos Rodríguez', 'Laura Martínez',
      'Pedro Fernández', 'Sofía Torres', 'Diego Ramírez', 'Valentina Castro', 'Andrés Gómez',
      'Camila Ruiz', 'Jorge Herrera', 'Paola Mendoza', 'Felipe Ortiz', 'Daniela Vargas',
      'Ricardo Silva', 'Catalina Rojas', 'Sebastián Mora',
    ],
    suppliers: [
      { name: 'Distribuidora Moda Total', contact: 'Pedro Sánchez', phone: '310-555-0201', email: 'pedro@modatotal.com' },
      { name: 'Importadora Textil SA', contact: 'Rosa Jiménez', phone: '315-555-0202', email: 'rosa@textilsa.com' },
      { name: 'Mayorista Fashion', contact: 'Miguel Torres', phone: '320-555-0203', email: 'miguel@fashion.com' },
    ],
    products: [
      { name: 'Jeans Clásicos', sku: 'JEAN-001', price: 89900, cost: 42000, stock: 45, size: ['M', 'L'], color: ['Azul'], material: ['Algodón', 'Mezclilla'], type: 'Ropa' },
      { name: 'Jeans Skinny', sku: 'JEAN-002', price: 95000, cost: 45000, stock: 32, size: ['S', 'M'], color: ['Negro'], material: ['Algodón', 'Mezclilla'], type: 'Ropa' },
      { name: 'Pantalón Cargo', sku: 'PANT-001', price: 75000, cost: 35000, stock: 18, size: ['M'], color: ['Verde'], material: ['Algodón', 'Poliéster'], type: 'Ropa' },
      { name: 'Camiseta Básica', sku: 'CAMI-001', price: 35000, cost: 15000, stock: 120, size: ['S', 'M', 'L'], color: ['Blanco', 'Negro'], material: ['Algodón'], type: 'Ropa' },
      { name: 'Camisa Formal', sku: 'CAMI-002', price: 120000, cost: 55000, stock: 25, size: ['L', 'XL'], color: ['Azul', 'Blanco'], material: ['Algodón'], type: 'Ropa' },
      { name: 'Blusa Seda', sku: 'BLUS-001', price: 78000, cost: 35000, stock: 22, size: ['S', 'M'], color: ['Beige'], material: ['Seda'], type: 'Ropa' },
      { name: 'Chaqueta Denim', sku: 'CHAQ-001', price: 185000, cost: 90000, stock: 10, size: ['L'], color: ['Azul'], material: ['Mezclilla'], type: 'Ropa' },
      { name: 'Chaqueta Cuero', sku: 'CHAQ-002', price: 350000, cost: 170000, stock: 9, size: ['M', 'L'], color: ['Negro'], material: ['Cuero'], type: 'Ropa' },
      { name: 'Vestido Floral', sku: 'VEST-001', price: 95000, cost: 45000, stock: 20, size: ['M'], color: ['Rosa'], material: ['Algodón'], type: 'Ropa' },
      { name: 'Vestido Noche', sku: 'VEST-002', price: 250000, cost: 120000, stock: 7, size: ['S', 'M'], color: ['Negro'], material: ['Satén'], type: 'Ropa' },
      { name: 'Falda Plisada', sku: 'FALD-001', price: 65000, cost: 30000, stock: 15, size: ['S', 'M'], color: ['Negro'], material: ['Poliéster'], type: 'Ropa' },
      { name: 'Sudadera Hoodie', sku: 'SUDA-001', price: 120000, cost: 55000, stock: 33, size: ['L', 'XL'], color: ['Gris', 'Negro'], material: ['Algodón'], type: 'Ropa' },
      { name: 'Sudadera Crop', sku: 'SUDA-002', price: 95000, cost: 45000, stock: 28, size: ['S'], color: ['Rosa'], material: ['Algodón'], type: 'Ropa' },
      { name: 'Cinturón Cuero', sku: 'CINT-001', price: 55000, cost: 25000, stock: 40, size: ['Única'], color: ['Marrón', 'Negro'], material: ['Cuero'], type: 'Accesorio' },
      { name: 'Gafas Sol', sku: 'GAFAS-001', price: 75000, cost: 35000, stock: 24, size: ['Única'], color: ['Negro'], material: ['Plástico'], type: 'Accesorio' },
      { name: 'Shorts Deportivos', sku: 'SHRT-001', price: 55000, cost: 25000, stock: 26, size: ['M'], color: ['Negro'], material: ['Poliéster'], type: 'Ropa' },
      { name: 'Zapatos Casuales', sku: 'ZAP-001', price: 210000, cost: 120000, stock: 14, size: ['40', '41'], color: ['Café'], material: ['Cuero'], type: 'Calzado' },
      { name: 'Tenis Urbanos', sku: 'TEN-001', price: 260000, cost: 150000, stock: 16, size: ['39', '40'], color: ['Blanco'], material: ['Sintético'], type: 'Calzado' },
    ],
  },
  {
    code: 'DEP-001',
    name: 'Deportes Nova',
    admin: { username: 'dep_admin', email: 'admin@deportesnova.com', nombre: 'Carlos Deportes' },
    sellers: [
      { username: 'dep_andres', email: 'andres@deportesnova.com', nombre: 'Andrés Peña' },
      { username: 'dep_marta', email: 'marta@deportesnova.com', nombre: 'Marta Gil' },
    ],
    daily: { min: 1, max: 3, weekendExtra: 2 },
    customers: [
      'Luis Herrera', 'Carmen Díaz', 'Roberto Salas', 'Elena Ríos', 'Pablo Quintana',
      'Natalia Bravo', 'Oscar Cárdenas', 'Julia Pino', 'Héctor Navas', 'Silvia Arenas',
      'Tomás Guerra', 'Beatriz Solano', 'Iván Corrales', 'Rocío Delgado', 'Emilio Cabrera',
      'Ángela Fuentes', 'Raúl Márquez', 'Patricia Sarmiento',
    ],
    suppliers: [
      { name: 'Deportes Import SA', contact: 'Felipe Arango', phone: '310-555-0301', email: 'felipe@deportesimport.com' },
      { name: 'Multideporte Mayorista', contact: 'Sandra Valle', phone: '315-555-0302', email: 'sandra@multideporte.com' },
      { name: 'Pro Fitness Supply', contact: 'Andrés Mora', phone: '320-555-0303', email: 'andres@profitness.com' },
    ],
    products: [
      { name: 'Balón de Fútbol #5', sku: 'BDF-001', price: 89900, cost: 52000, stock: 40, size: ['5'], color: ['Blanco'], material: ['Cuero sintético'], type: 'Balones' },
      { name: 'Balón de Baloncesto', sku: 'BDB-002', price: 110000, cost: 65000, stock: 25, size: ['7'], color: ['Naranja'], material: ['Cuero sintético'], type: 'Balones' },
      { name: 'Zapatillas Running', sku: 'ZAP-RUN-003', price: 289000, cost: 165000, stock: 18, size: ['39', '40', '41'], color: ['Negro', 'Gris'], material: ['Sintético'], type: 'Calzado' },
      { name: 'Zapatillas Entrenamiento', sku: 'ZAP-TRN-004', price: 249000, cost: 142000, stock: 15, size: ['40', '42'], color: ['Azul'], material: ['Sintético'], type: 'Calzado' },
      { name: 'Botines Taco Blade', sku: 'BOT-015', price: 320000, cost: 185000, stock: 11, size: ['40', '41'], color: ['Negro'], material: ['Sintético'], type: 'Calzado' },
      { name: 'Camiseta Deportiva Local', sku: 'CAM-DEP-005', price: 159000, cost: 90000, stock: 55, size: ['S', 'M', 'L'], color: ['Amarillo'], material: ['Poliéster'], type: 'Ropa' },
      { name: 'Short Deportivo', sku: 'SHR-DEP-006', price: 79000, cost: 42000, stock: 38, size: ['M', 'L'], color: ['Negro'], material: ['Poliéster'], type: 'Ropa' },
      { name: 'Sudadera Deportiva', sku: 'SUD-DEP-012', price: 130000, cost: 75000, stock: 22, size: ['L'], color: ['Gris'], material: ['Algodón'], type: 'Ropa' },
      { name: 'Bicicleta Montaña 26"', sku: 'BIC-26-007', price: 1850000, cost: 1150000, stock: 5, size: ['26'], color: ['Negro', 'Verde'], material: ['Aluminio'], type: 'Equipos' },
      { name: 'Pesa Mancuerna 5kg', sku: 'MAN-5-008', price: 49000, cost: 26000, stock: 30, size: ['5kg'], color: ['Negro'], material: ['Neopreno'], type: 'Equipos' },
      { name: 'Kit Yoga Mat', sku: 'YOGA-009', price: 120000, cost: 68000, stock: 20, size: ['Única'], color: ['Morado'], material: ['PVC'], type: 'Equipos' },
      { name: 'Termo Deportivo 1L', sku: 'TERM-010', price: 45000, cost: 23000, stock: 45, size: ['1L'], color: ['Negro', 'Rojo'], material: ['Acero'], type: 'Accesorios' },
      { name: 'Cuerda de Saltar', sku: 'CUE-011', price: 25000, cost: 12000, stock: 35, size: ['Única'], color: ['Negro'], material: ['PVC'], type: 'Accesorios' },
      { name: 'Guantes de Boxeo', sku: 'GUP-013', price: 165000, cost: 95000, stock: 12, size: ['12oz'], color: ['Rojo'], material: ['Cuero sintético'], type: 'Equipos' },
      { name: 'Raqueta de Tenis', sku: 'RAQ-014', price: 420000, cost: 245000, stock: 8, size: ['Única'], color: ['Azul'], material: ['Grafito'], type: 'Equipos' },
      { name: 'Rodillera Compresión', sku: 'ROD-016', price: 55000, cost: 28000, stock: 27, size: ['Única'], color: ['Negro'], material: ['Elastano'], type: 'Accesorios' },
      { name: 'Banda Elástica Resistencia', sku: 'BAN-017', price: 35000, cost: 15000, stock: 30, size: ['Única'], color: ['Verde'], material: ['Látex'], type: 'Accesorios' },
      { name: 'Guantes de Portero', sku: 'GUP-PRT-018', price: 140000, cost: 80000, stock: 10, size: ['9', '10'], color: ['Amarillo'], material: ['Látex'], type: 'Equipos' },
    ],
  },
  {
    code: 'SUP-001',
    name: 'Supermercado Nova',
    admin: { username: 'sup_admin', email: 'admin@supermercadonova.com', nombre: 'Marlon Duarte' },
    sellers: [
      { username: 'sup_carmen', email: 'carmen@supermercadonova.com', nombre: 'Carmen Rosa' },
      { username: 'sup_jose', email: 'jose@supermercadonova.com', nombre: 'José Payano' },
    ],
    daily: { min: 2, max: 5, weekendExtra: 3 },
    customers: [
      'Rosa Linares', 'Manuel Santana', 'Julieta Núñez', 'Gregorio Mejía', 'Ivonne Castro',
      'Samuel Valdez', 'Teresa Guzmán', 'Efraín Lara', 'Xiomara Felix', 'Ambiorix Batista',
      'Milagros Peña', 'Franklin Rosario', 'Yolanda Paredes', 'Moisés Camacho', 'Gisela Montaño',
      'Nelson Ventura', 'Aurora Polanco', 'Ramón Aquino',
    ],
    suppliers: [
      { name: 'Distribuidora Alimentos del Sur', contact: 'Ernesto Ríos', phone: '310-555-0401', email: 'ernesto@alimentossur.com' },
      { name: 'Agroimportadora Nacional', contact: 'Bety Cruz', phone: '315-555-0402', email: 'bety@agroimport.com' },
      { name: 'Bebidas y Más SA', contact: 'Wilfredo De León', phone: '320-555-0403', email: 'wilfredo@bebidasymas.com' },
    ],
    products: [
      { name: 'Arroz Blanco 5lb', sku: 'ARROZ-5-001', price: 18900, cost: 15200, stock: 200, size: ['5lb'], color: ['Estándar'], material: ['Grano'], type: 'Granos' },
      { name: 'Aceite Vegetal 1L', sku: 'ACEI-1L-002', price: 15900, cost: 11800, stock: 150, size: ['1L'], color: ['Estándar'], material: ['Líquido'], type: 'Despensa' },
      { name: 'Leche Entera 1L', sku: 'LECH-1L-003', price: 3900, cost: 2900, stock: 300, size: ['1L'], color: ['Blanco'], material: ['Lácteo'], type: 'Lácteos' },
      { name: 'Huevos Blancos x30', sku: 'HUEV-30-004', price: 7850, cost: 5900, stock: 120, size: ['30u'], color: ['Estándar'], material: ['Huevo'], type: 'Huevos' },
      { name: 'Harina de Trigo 1kg', sku: 'HARI-1-005', price: 6800, cost: 4900, stock: 90, size: ['1kg'], color: ['Blanco'], material: ['Polvo'], type: 'Despensa' },
      { name: 'Azúcar Blanca 1kg', sku: 'AZUC-1-006', price: 6200, cost: 4400, stock: 110, size: ['1kg'], color: ['Estándar'], material: ['Granulado'], type: 'Despensa' },
      { name: 'Café Molido 500g', sku: 'CAFE-500-007', price: 34000, cost: 24500, stock: 60, size: ['500g'], color: ['Estándar'], material: ['Molido'], type: 'Despensa' },
      { name: 'Atún en Lata', sku: 'ATUN-008', price: 6800, cost: 4800, stock: 130, size: ['170g'], color: ['Estándar'], material: ['Enlatado'], type: 'Conservas' },
      { name: 'Pasta Espagueti 500g', sku: 'PAST-009', price: 4600, cost: 3200, stock: 140, size: ['500g'], color: ['Estándar'], material: ['Pasta'], type: 'Despensa' },
      { name: 'Pan de Molde Blanco', sku: 'PAN-010', price: 9500, cost: 6800, stock: 80, size: ['600g'], color: ['Blanco'], material: ['Pan'], type: 'Panadería' },
      { name: 'Jabón en Barra', sku: 'JABO-011', price: 2900, cost: 1800, stock: 220, size: ['Única'], color: ['Blanco'], material: ['Higiene'], type: 'Aseo' },
      { name: 'Papel Higiénico x4', sku: 'PAPE-012', price: 7800, cost: 5600, stock: 160, size: ['x4'], color: ['Blanco'], material: ['Higiene'], type: 'Aseo' },
      { name: 'Jugo de Naranja 1L', sku: 'JUGO-013', price: 7200, cost: 5200, stock: 75, size: ['1L'], color: ['Naranja'], material: ['Líquido'], type: 'Bebidas' },
      { name: 'Refresco Cola 2L', sku: 'REFR-014', price: 9900, cost: 7100, stock: 100, size: ['2L'], color: ['Oscuro'], material: ['Líquido'], type: 'Bebidas' },
      { name: 'Detergente en Polvo 1kg', sku: 'DETE-015', price: 10800, cost: 7600, stock: 95, size: ['1kg'], color: ['Azul'], material: ['Aseo'], type: 'Aseo' },
      { name: 'Galletas de Soda', sku: 'GAL-016', price: 4200, cost: 3000, stock: 170, size: ['x8'], color: ['Estándar'], material: ['Galleta'], type: 'Snacks' },
      { name: 'Queso Amarillo 400g', sku: 'QUES-017', price: 12800, cost: 9800, stock: 55, size: ['400g'], color: ['Amarillo'], material: ['Lácteo'], type: 'Lácteos' },
      { name: 'Pollo Entero 1kg', sku: 'POLL-018', price: 12900, cost: 10100, stock: 65, size: ['1kg'], color: ['Natural'], material: ['Cárnico'], type: 'Carnes' },
    ],
  },
  {
    code: 'TEC-001',
    name: 'Tecnología Nova',
    admin: { username: 'tec_admin', email: 'admin@tecnologianova.com', nombre: 'Laura Tecnología' },
    sellers: [
      { username: 'tec_javier', email: 'javier@tecnologianova.com', nombre: 'Javier Mena' },
      { username: 'tec_diana', email: 'diana@tecnologianova.com', nombre: 'Diana Rivas' },
    ],
    daily: { min: 1, max: 3, weekendExtra: 1 },
    customers: [
      'Adrián Peña', 'Miriam Cuevas', 'Ernesto Bautista', 'Claudia Payano', 'Simón Reyes',
      'Alicia Mota', 'Darío Núñez', 'Gabriela Figueroa', 'Óscar Villar', 'Ruth Caba',
      'Fabián Lugo', 'Susana Pina', 'Edwin Santamaría', 'Nayeli Cruz', 'Víctor Arce',
      'Lorena Batista', 'César Urtecho', 'Dulce Almonte',
    ],
    suppliers: [
      { name: 'Tecnodistribuidor del Caribe', contact: 'Humberto Lozano', phone: '310-555-0501', email: 'humberto@tecnocaribe.com' },
      { name: 'Importadora Gizmo', contact: 'Génesis Infante', phone: '315-555-0502', email: 'genesis@gizmo.com' },
      { name: 'Digital Supply DR', contact: 'Omar Fajardo', phone: '320-555-0503', email: 'omar@digitalsupply.com' },
    ],
    products: [
      { name: 'Laptop 14" 256GB', sku: 'LAP-14-001', price: 2890000, cost: 2250000, stock: 8, size: ['14"'], color: ['Plata'], material: ['Aluminio'], type: 'Computadores' },
      { name: 'Smartphone Gama Media', sku: 'SMART-002', price: 1750000, cost: 1380000, stock: 15, size: ['6.5"'], color: ['Negro'], material: ['Vidrio'], type: 'Móviles' },
      { name: 'Audífonos Bluetooth', sku: 'AUDI-003', price: 145000, cost: 82000, stock: 45, size: ['Única'], color: ['Blanco'], material: ['Plástico'], type: 'Audio' },
      { name: 'Teclado Mecánico', sku: 'TECL-004', price: 85000, cost: 48000, stock: 30, size: ['Única'], color: ['Negro'], material: ['Plástico'], type: 'Accesorios' },
      { name: 'Mouse Inalámbrico', sku: 'MOUS-005', price: 45000, cost: 25000, stock: 60, size: ['Única'], color: ['Negro'], material: ['Plástico'], type: 'Accesorios' },
      { name: 'Monitor 24" FHD', sku: 'MON-24-006', price: 950000, cost: 690000, stock: 12, size: ['24"'], color: ['Negro'], material: ['Plástico'], type: 'Periféricos' },
      { name: 'Cámara Web Full HD', sku: 'CAMW-007', price: 110000, cost: 62000, stock: 25, size: ['Única'], color: ['Negro'], material: ['Plástico'], type: 'Periféricos' },
      { name: 'Smartwatch Deportivo', sku: 'SMARTW-008', price: 320000, cost: 190000, stock: 18, size: ['Única'], color: ['Negro'], material: ['Aluminio'], type: 'Wearables' },
      { name: 'Tablet 10" 64GB', sku: 'TAB-10-009', price: 650000, cost: 460000, stock: 14, size: ['10"'], color: ['Gris'], material: ['Aluminio'], type: 'Tablets' },
      { name: 'Cargador USB-C 65W', sku: 'CARG-010', price: 60000, cost: 31000, stock: 70, size: ['65W'], color: ['Blanco'], material: ['Plástico'], type: 'Accesorios' },
      { name: 'Cable HDMI 2m', sku: 'HDMI-011', price: 35000, cost: 16000, stock: 55, size: ['2m'], color: ['Negro'], material: ['PVC'], type: 'Cables' },
      { name: 'Bocina Bluetooth', sku: 'BOC-012', price: 250000, cost: 145000, stock: 16, size: ['Única'], color: ['Azul'], material: ['Plástico'], type: 'Audio' },
      { name: 'Router WiFi 6', sku: 'ROUT-013', price: 230000, cost: 140000, stock: 20, size: ['Única'], color: ['Negro'], material: ['Plástico'], type: 'Redes' },
      { name: 'Impresora Multifunción', sku: 'IMPR-014', price: 420000, cost: 260000, stock: 9, size: ['Única'], color: ['Negro'], material: ['Plástico'], type: 'Periféricos' },
      { name: 'Micrófono USB', sku: 'MICR-015', price: 180000, cost: 98000, stock: 12, size: ['Única'], color: ['Negro'], material: ['Metal'], type: 'Audio' },
      { name: 'Disco SSD 500GB', sku: 'SSD-500-016', price: 280000, cost: 175000, stock: 22, size: ['500GB'], color: ['Negro'], material: ['Metal'], type: 'Componentes' },
      { name: 'Batería Portátil 20000mAh', sku: 'BAT-017', price: 120000, cost: 68000, stock: 28, size: ['20000mAh'], color: ['Negro'], material: ['Plástico'], type: 'Accesorios' },
      { name: 'Webcam Ring Light', sku: 'RING-018', price: 95000, cost: 54000, stock: 15, size: ['Única'], color: ['Blanco'], material: ['Plástico'], type: 'Periféricos' },
    ],
  },
]

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function paymentMethod() {
  const r = Math.random()
  if (r < 0.45) return 'efectivo'
  if (r < 0.8) return 'tarjeta'
  return 'transferencia'
}

function pad(n, len) {
  return String(n).padStart(len, '0')
}

async function seedStore(config) {
  const log = []
  const store = await prisma.store.create({ data: { code: config.code, name: config.name } })

  const adminPass = await bcrypt.hash('admin123', 10)
  const sellerPass = await bcrypt.hash('vendedor123', 10)

  const admin = await prisma.user.create({
    data: {
      username: config.admin.username, email: config.admin.email, password: adminPass,
      nombre: config.admin.nombre, rol: 'admin', storeId: store.id,
    },
  })

  const sellers = []
  for (const s of config.sellers) {
    sellers.push(await prisma.user.create({
      data: {
        username: s.username, email: s.email, password: sellerPass,
        nombre: s.nombre, rol: 'vendedor', storeId: store.id,
      },
    }))
  }
  const salesStaff = [...sellers, admin]

  const products = []
  const productMap = {}
  for (const p of config.products) {
    const rec = await prisma.product.create({
      data: {
        name: p.name, sku: p.sku, price: p.price, cost: p.cost, stock: p.stock,
        size: p.size, color: p.color, material: p.material, type: p.type, description: null,
        storeId: store.id,
      },
    })
    products.push(rec)
    productMap[p.sku] = rec
  }

  await prisma.inventoryMovement.createMany({
    data: products.map((p) => ({
      productId: p.id, storeId: store.id, type: 'entrada', quantity: p.stock,
      reason: 'Inventario inicial', createdAt: new Date(now.getTime() - DAYS * 86400000),
    })),
  })

  const customers = []
  for (let i = 0; i < config.customers.length; i++) {
    customers.push(await prisma.customer.create({
      data: {
        name: config.customers[i],
        email: `cliente${i + 1}@${config.code.toLowerCase().replace('-', '').toLowerCase()}.com`,
        phone: `3${randInt(10, 19)}-555-${pad(randInt(100, 999), 3)}`,
        address: `Calle ${randInt(1, 120)} #${randInt(1, 50)}-${randInt(1, 80)}`,
        points: randInt(0, 300),
        storeId: store.id,
      },
    }))
  }

  const suppliers = []
  for (const s of config.suppliers) {
    suppliers.push(await prisma.supplier.create({ data: { ...s, storeId: store.id } }))
  }

  const sales = []
  const saleItems = []
  let invoiceSeq = 1
  let anuladas = 0

  for (let d = DAYS; d >= 0; d--) {
    const date = new Date(now.getTime() - d * 86400000)
    const weekday = date.getDay()

    let count = randInt(config.daily.min, config.daily.max)
    if (weekday === 0 || weekday === 6) count += config.daily.weekendExtra
    if (date.getMonth() === 11) count = Math.round(count * 1.6)
    if (date.getMonth() === 0 && date.getDate() <= 5) count = Math.round(count * 1.3)
    if (Math.random() < 0.08 && config.daily.max <= 3) count = 0

    for (let i = 0; i < count; i++) {
      const nItems = 1 + (Math.random() < 0.35 ? 1 : 0) + (Math.random() < 0.15 ? 1 : 0)
      const chosen = []
      const idx = [...products.keys()]
      for (let k = 0; k < nItems; k++) {
        chosen.push(idx.splice(Math.floor(Math.random() * idx.length), 1)[0])
      }

      let subtotal = 0
      const itemsForSale = []
      for (const pIdx of chosen) {
        const product = products[pIdx]
        const qty = randInt(1, config.code === 'SUP-001' ? 4 : 2)
        let linePrice = Number(product.price) * qty
        let lineDisc = 0
        if (Math.random() < 0.08) {
          lineDisc = Math.round(linePrice * (randInt(5, 15) / 100))
        }
        const lineSubtotal = linePrice - lineDisc
        subtotal += lineSubtotal
        itemsForSale.push({
          productId: product.id, quantity: qty, price: Number(product.price),
          discount: lineDisc, subtotal: lineSubtotal, storeId: store.id,
        })
      }

      let discount = 0
      if (Math.random() < 0.04) discount = Math.round(subtotal * (randInt(2, 8) / 100))
      const tax = Math.round(subtotal * TAX_RATE)
      const total = subtotal - discount + tax

      const customer = Math.random() < 0.8 ? pick(customers) : null
      const seller = Math.random() < 0.7 ? pick(sellers) : admin
      const status = Math.random() < 0.04 ? 'anulada' : 'activa'
      if (status === 'anulada') anuladas++

      const saleDate = new Date(date)
      saleDate.setHours(randInt(8, 20), randInt(0, 59), randInt(0, 59), 0)

      const saleId = randomUUID()
      sales.push({
        id: saleId, invoice: `INV-${config.code}-${pad(invoiceSeq, 5)}`, total,
        subtotal, tax, discount, paymentMethod: paymentMethod(),
        customerId: customer ? customer.id : null, userId: seller.id,
        status, motivoAnulacion: status === 'anulada' ? pick(['Compra por error del cliente', 'Producto en mal estado', 'Cambio de producto']) : null,
        createdAt: saleDate, storeId: store.id,
      })
      invoiceSeq++

      for (const it of itemsForSale) {
        saleItems.push({ ...it, saleId })
      }
    }
  }

  for (let i = 0; i < sales.length; i += SALE_CHUNK) {
    await prisma.sale.createMany({ data: sales.slice(i, i + SALE_CHUNK) })
  }
  for (let i = 0; i < saleItems.length; i += SALE_CHUNK) {
    await prisma.saleItem.createMany({ data: saleItems.slice(i, i + SALE_CHUNK) })
  }

  const recentSales = sales.filter((s) => s.status === 'activa').slice(-40)
  const devolutions = []
  const devolutionItems = []
  for (let v = 0; v < Math.min(8, recentSales.length); v++) {
    const sale = recentSales[v]
    const items = saleItems.filter((it) => it.saleId === sale.id)
    if (items.length === 0) continue
    const chosenItems = items.filter(() => Math.random() < 0.7)
    if (chosenItems.length === 0) continue
    const devId = randomUUID()
    let devTotal = 0
    for (const it of chosenItems) {
      const qty = randInt(1, it.quantity)
      const subtotal = Number(it.price) * qty
      devTotal += subtotal
      devolutionItems.push({
        devolutionId: devId, productId: it.productId, quantity: qty,
        price: Number(it.price), subtotal, motivo: pick(['Cambio de talla', 'Producto defectuoso', 'No era lo esperado']),
        storeId: store.id,
      })
    }
    devolutions.push({
      id: devId, invoice: `DEV-${config.code}-${pad(v + 1, 4)}`, saleId: sale.id,
      total: devTotal, motivo: 'Devolución de cliente', userId: sale.userId,
      createdAt: new Date(new Date(sale.createdAt).getTime() + 86400000),
      storeId: store.id,
    })
  }
  if (devolutions.length) {
    await prisma.devolution.createMany({ data: devolutions })
    await prisma.devolutionItem.createMany({ data: devolutionItems })
  }

  const purchases = []
  const purchaseItems = []
  let purchaseSeq = 1
  for (let pz = 0; pz < randInt(14, 20); pz++) {
    const pDate = new Date(now.getTime() - randInt(0, DAYS) * 86400000)
    const supplier = pick(suppliers)
    const nItems = randInt(2, 4)
    const used = []
    let total = 0
    const purchaseId = randomUUID()
    for (let k = 0; k < nItems; k++) {
      let pi = randInt(0, products.length - 1)
      while (used.includes(pi)) pi = randInt(0, products.length - 1)
      used.push(pi)
      const product = products[pi]
      const qty = randInt(10, 60)
      const subtotal = Number(product.cost) * qty
      total += subtotal
      purchaseItems.push({
        purchaseId, productId: product.id, quantity: qty, price: Number(product.cost),
        subtotal, storeId: store.id,
      })
    }
    purchases.push({
      id: purchaseId, invoice: `PUR-${config.code}-${pad(purchaseSeq, 4)}`,
      supplierId: supplier.id, total,
      status: Math.random() < 0.6 ? 'pagado' : 'pendiente',
      createdAt: pDate, storeId: store.id,
    })
    purchaseSeq++
  }
  for (const p of purchases) {
    const items = purchaseItems.filter((it) => it.purchaseId === p.id).map(({ purchaseId, ...rest }) => rest)
    await prisma.purchase.create({ data: { ...p, items: { create: items } } })
  }

  const openRegister = await prisma.cashRegister.create({
    data: {
      storeId: store.id, userId: admin.id, status: 'abierta',
      initialAmount: randInt(30000, 120000),
      openDate: new Date(now.getTime() - 2 * 3600000),
    },
  })
  await prisma.cashMovement.create({
    data: {
      cashRegisterId: openRegister.id, storeId: store.id, userId: admin.id,
      type: 'entrada', amount: openRegister.initialAmount, reason: 'Apertura de caja',
      createdAt: openRegister.openDate,
    },
  })

  log.push(`${config.name}: ${products.length} productos, ${customers.length} clientes, ${suppliers.length} proveedores`)
  log.push(`  Ventas: ${sales.length} (${anuladas} anuladas), ${saleItems.length} partidas, ${devolutions.length} devoluciones, ${purchases.length} compras`)
  return log
}

async function main() {
  console.log('Sembrando 4 tiendas con 3 años de histórico en Neon...')
  const start = Date.now()

  for (const config of storesConfig) {
    for (const line of await seedStore(config)) console.log(line)
  }

  const totalSales = await prisma.sale.count()
  const totalItems = await prisma.saleItem.count()
  const totalUsers = await prisma.user.count()
  const totalProducts = await prisma.product.count()
  const totalCustomers = await prisma.customer.count()

  console.log(`\nTotales: ${totalUsers} usuarios, ${totalProducts} productos, ${totalCustomers} clientes, ${totalSales} ventas, ${totalItems} partidas`)
  console.log(`Tiempo total: ${((Date.now() - start) / 1000).toFixed(1)}s`)
  console.log('Accesos (password admin123 / vendedor123):')
  console.log('  admin / admin123        -> Moda Nova - Ropa')
  console.log('  dep_admin / admin123    -> Deportes Nova')
  console.log('  sup_admin / admin123    -> Supermercado Nova')
  console.log('  tec_admin / admin123    -> Tecnología Nova')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })