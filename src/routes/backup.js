import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import { backupLimiter } from '../middleware/rate-limit.js'
import * as backup from '../controllers/backup.controller.js'

const router = Router()

router.post('/', authenticateToken, requireAdmin, backupLimiter, asyncHandler(backup.createBackup))
router.get('/list', authenticateToken, requireAdmin, asyncHandler(backup.listBackups))

export default router
