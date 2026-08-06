import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as purchases from '../controllers/purchases.controller.js'

const router = Router()

router.get('/', authenticateToken, asyncHandler(purchases.listPurchases))
router.post('/', authenticateToken, requireAdmin, asyncHandler(purchases.createPurchase))
router.put('/:id/status', authenticateToken, requireAdmin, asyncHandler(purchases.updatePurchaseStatus))

export default router
