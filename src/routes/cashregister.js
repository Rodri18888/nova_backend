import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as cashregister from '../controllers/cashregister.controller.js'

const router = Router()

router.get('/current', authenticateToken, asyncHandler(cashregister.getCurrent))
router.get('/history', authenticateToken, asyncHandler(cashregister.getHistory))
router.post('/open', authenticateToken, requireAdmin, asyncHandler(cashregister.openRegister))
router.post('/close', authenticateToken, requireAdmin, asyncHandler(cashregister.closeRegister))
router.post('/movement', authenticateToken, requireAdmin, asyncHandler(cashregister.createMovement))

export default router
