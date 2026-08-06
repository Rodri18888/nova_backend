import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken } from '../middleware/auth.js'
import { getStats } from '../controllers/dashboard.controller.js'

const router = Router()

router.get('/stats', authenticateToken, asyncHandler(getStats))

export default router
