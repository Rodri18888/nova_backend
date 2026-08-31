import Stripe from 'stripe'
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