import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as users from '../controllers/users.controller.js'

const router = Router()

router.use(authenticateToken, requireAdmin)

router.get('/', asyncHandler(users.listUsers))
router.post('/', asyncHandler(users.createUser))
router.put('/:id', asyncHandler(users.updateUser))
router.delete('/:id', asyncHandler(users.deleteUser))

export default router
