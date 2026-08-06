import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as devolutions from '../controllers/devolutions.controller.js'

const router = Router()

router.get('/', authenticateToken, asyncHandler(devolutions.listDevolutions))
router.post('/', authenticateToken, requireAdmin, asyncHandler(devolutions.createDevolution))

export default router
