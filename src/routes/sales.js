import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as sales from '../controllers/sales.controller.js'

const router = Router()

router.get('/', authenticateToken, asyncHandler(sales.listSales))
router.post('/', authenticateToken, asyncHandler(sales.createSale))
router.get('/:id', authenticateToken, asyncHandler(sales.getSale))
router.put('/:id/anular', authenticateToken, requireAdmin, asyncHandler(sales.cancelSale))

export default router
