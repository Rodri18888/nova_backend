import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as store from '../controllers/store.controller.js'

const router = Router()

router.get('/config', authenticateToken, asyncHandler(store.getConfig))
router.put('/config', authenticateToken, requireAdmin, asyncHandler(store.updateConfig))

export default router
