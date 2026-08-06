import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken } from '../middleware/auth.js'
import * as exporter from '../controllers/export.controller.js'

const router = Router()

router.get('/sales', authenticateToken, asyncHandler(exporter.exportSales))
router.get('/products', authenticateToken, asyncHandler(exporter.exportProducts))

export default router
