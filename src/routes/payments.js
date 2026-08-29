import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as payments from '../controllers/payments.controller.js'

const router = Router()

router.post('/intent', authenticateToken, asyncHandler(payments.createPaymentIntent))
router.post('/verify', authenticateToken, asyncHandler(payments.verifyPaymentIntent))

export default router