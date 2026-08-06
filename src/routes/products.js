import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as products from '../controllers/products.controller.js'

const router = Router()

router.get('/', authenticateToken, asyncHandler(products.listProducts))
router.post('/', authenticateToken, requireAdmin, asyncHandler(products.createProduct))
router.put('/:id', authenticateToken, requireAdmin, asyncHandler(products.updateProduct))
router.put('/:id/stock', authenticateToken, requireAdmin, asyncHandler(products.updateStock))
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(products.deleteProduct))

export default router
