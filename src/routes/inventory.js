import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as inventory from '../controllers/inventory.controller.js'

const router = Router()

router.get('/movements', authenticateToken, asyncHandler(inventory.listMovements))
router.post('/movements', authenticateToken, requireAdmin, asyncHandler(inventory.createMovement))

export default router
