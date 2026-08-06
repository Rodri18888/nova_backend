import { Router } from 'express'
import { asyncHandler } from '../lib/route-helpers.js'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import * as customers from '../controllers/customers.controller.js'

const router = Router()

router.get('/', authenticateToken, asyncHandler(customers.listCustomers))
router.post('/', authenticateToken, asyncHandler(customers.createCustomer))
router.put('/:id', authenticateToken, requireAdmin, asyncHandler(customers.updateCustomer))
router.delete('/:id', authenticateToken, requireAdmin, asyncHandler(customers.deleteCustomer))

export default router
