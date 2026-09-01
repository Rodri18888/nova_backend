import Stripe from 'stripe'
import { prisma } from '../prisma.js'
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../config.js'

const stripe = new Stripe(STRIPE_SECRET_KEY)

export async function createPaymentIntent(req, res) {
  const { amount } = req.body
  if (!amount || amount <= 0)
    return res.status(400).json({ error: 'Monto inválido' })
  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'dop',
      metadata: { storeId: req.user?.storeId || '' },
    })
    res.json({ clientSecret: intent.client_secret })
  } catch (e) {
    res.status(500).json({ error: `Stripe: ${e.message}` })
  }
}

export async function verifyPaymentIntent(req, res) {
  const { paymentIntentId } = req.body
  if (!paymentIntentId) return res.status(400).json({ error: 'paymentIntentId requerido' })
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)
  res.json({ status: intent.status, amount: intent.amount })
}

export async function handleWebhook(req, res) {
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], STRIPE_WEBHOOK_SECRET)
  } catch (e) {
    return res.status(400).json({ error: `Verificación falló: ${e.message}` })
  }
  switch (event.type) {
    case 'payment_intent.succeeded':
      const intent = event.data.object
      await prisma.sale.updateMany({ where: { stripePaymentIntentId: intent.id }, data: { status: 'pagada' } })
      break
  }
  res.json({ received: true })
}

export async function refundPayment(req, res) {
  const { saleId } = req.body
  if (!saleId) return res.status(400).json({ error: 'saleId requerido' })

  const sale = await prisma.sale.findUnique({ where: { id: saleId } })
  if (!sale) return res.status(404).json({ error: 'Venta no encontrada' })
  if (sale.storeId !== req.user.storeId)
    return res.status(403).json({ error: 'Venta no pertenece a esta tienda' })
  if (!sale.stripePaymentIntentId)
    return res.status(400).json({ error: 'Venta sin pago Stripe' })
  if (sale.status === 'anulada')
    return res.status(400).json({ error: 'Venta ya anulada' })
  if (sale.stripeRefundId)
    return res.status(400).json({ error: 'Venta ya reembolsada' })

  const refund = await stripe.refunds.create({
    payment_intent: sale.stripePaymentIntentId,
  })

  await prisma.sale.update({
    where: { id: saleId },
    data: { status: 'anulada', stripeRefundId: refund.id, motivoAnulacion: 'Reembolso Stripe' },
  })

  res.json({ ok: true, refundId: refund.id })
}