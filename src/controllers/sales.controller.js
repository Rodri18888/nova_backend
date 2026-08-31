import { prisma } from '../prisma.js'
import { sanitizeString } from '../lib/route-helpers.js'
import { getNextInvoice } from '../utils/sequence.js'
import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from '../config.js'

const stripe = new Stripe(STRIPE_SECRET_KEY)

export async function listSales(req, res) {
  res.json(await prisma.sale.findMany({
    include: { customer: true, user: true, items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  }))
}

export async function getSale(req, res) {
  res.json(await prisma.sale.findUnique({
    where: { id: req.params.id },
    include: { customer: true, user: true, items: { include: { product: true } } },
  }))
}

export async function createSale(req, res) {
  const { customerId, paymentMethod, items, discount, paymentIntentId } = req.body;
  if (paymentMethod === "Tarjeta") {
    const { paymentIntentId } = req.body;
    if (!paymentIntentId)
      return res
        .status(400)
        .json({ error: "PaymentIntent requerido para tarjeta" });
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status !== "succeeded")
      return res.status(402).json({ error: "El pago no fue completado" });
    if (intent.metadata.storeId !== req.user.storeId)
      return res
        .status(403)
        .json({ error: "PaymentIntent no pertenece a esta tienda" });
  }
  if (!items?.length)
    return res.status(400).json({ error: "Debe incluir al menos un producto" });
  if (!["Efectivo", "Tarjeta", "Transferencia"].includes(paymentMethod))
    return res.status(400).json({ error: "Método de pago inválido" });

  const sale = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) throw new Error(`Producto ${item.productId} no encontrado`);
      if (product.stock < item.quantity)
        throw new Error(
          `Stock insuficiente para ${product.name}: disponible ${product.stock}`,
        );
    }
    const invoice = await getNextInvoice(prisma, tx);
    let calcSubtotal = 0,
      calcDiscount = 0;
    for (const item of items) {
      calcSubtotal += item.price * item.quantity;
      calcDiscount += (item.discount || 0) * item.quantity;
    }
    const calcTax = (calcSubtotal - (discount || 0)) * 0.19;
    const calcTotal = calcSubtotal - (discount || 0) + calcTax;

    const created = await tx.sale.create({
      data: {
        invoice,
        customerId: customerId || null,
        userId: req.user.id,
        paymentMethod,
        status: "activa",
        ...(paymentMethod === "Tarjeta" && paymentIntentId ? { stripePaymentIntentId: paymentIntentId } : {}),
        subtotal: calcSubtotal,
        tax: calcTax,
        total: calcTotal,
        discount: discount || 0,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            discount: i.discount || 0,
            subtotal: (i.price - (i.discount || 0)) * i.quantity,
          })),
        },
      },
      include: {
        customer: true,
        user: true,
        items: { include: { product: true } },
      },
    });
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
      await tx.inventoryMovement.create({
        data: {
          productId: item.productId,
          type: "salida",
          quantity: item.quantity,
          reason: `Venta ${invoice}`,
        },
      });
      if (customerId)
        await tx.customer.update({
          where: { id: customerId },
          data: {
            points: {
              increment: Math.floor((item.price * item.quantity) / 100),
            },
          },
        });
    }
    return created;
  });
  res.json(sale);
}

export async function cancelSale(req, res) {
  const { motivo } = req.body
  if (!motivo) return res.status(400).json({ error: 'Motivo de anulación requerido' })
  const sale = await prisma.sale.findUnique({ where: { id: req.params.id }, include: { items: true } })
  if (!sale) return res.status(404).json({ error: 'Venta no encontrada' })
  if (sale.status === 'anulada') return res.status(400).json({ error: 'Venta ya anulada' })

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.sale.update({ where: { id: req.params.id }, data: { status: 'anulada', motivoAnulacion: sanitizeString(motivo) } })
    for (const item of sale.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } })
      await tx.inventoryMovement.create({ data: { productId: item.productId, type: 'entrada', quantity: item.quantity, reason: `Anulación venta ${sale.invoice}` } })
    }
    return updated
  })
  res.json(result)
}
