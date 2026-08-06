import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import { crudRoutes } from '../lib/route-helpers.js'
import { prisma } from '../prisma.js'

export const suppliersRouter = Router()

suppliersRouter.use('/', authenticateToken, crudRoutes(prisma, 'supplier', {
  auth: { create: requireAdmin, update: requireAdmin, delete: requireAdmin },
  createFields: ['name', 'contact', 'phone', 'email', 'address'],
  updateFields: ['name', 'contact', 'phone', 'email', 'address'],
  sanitize: ['name'],
  onDelete: (id) => prisma.purchase.updateMany({ where: { supplierId: id }, data: { supplierId: null } }),
}))
