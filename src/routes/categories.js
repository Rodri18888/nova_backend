import { Router } from 'express'
import { authenticateToken, requireAdmin } from '../middleware/auth.js'
import { crudRoutes } from '../lib/route-helpers.js'
import { prisma } from '../prisma.js'

export const categoriesRouter = Router()

categoriesRouter.use('/', authenticateToken, crudRoutes(prisma, 'category', {
  orderBy: { name: 'asc' },
  auth: { create: requireAdmin, update: requireAdmin, delete: requireAdmin },
  createFields: ['name'],
  sanitize: ['name'],
  onDelete: (id) => prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } }),
}))
