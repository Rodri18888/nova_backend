import { Router } from 'express'
import auth from './auth.js'
import users from './users.js'
import products from './products.js'
import customers from './customers.js'
import sales from './sales.js'
import devolutions from './devolutions.js'
import purchases from './purchases.js'
import cashregister from './cashregister.js'
import inventory from './inventory.js'
import dashboard from './dashboard.js'
import store from './store.js'
import backup from './backup.js'
import exporter from './export.js'
import { suppliersRouter } from './suppliers.js'
import payments from './payments.js'

const router = Router()

router.use('/auth', auth)
router.use('/users', users)
router.use('/products', products)
router.use('/customers', customers)
router.use('/sales', sales)
router.use('/devolutions', devolutions)
router.use('/suppliers', suppliersRouter)
router.use('/purchases', purchases)
router.use('/cashregister', cashregister)
router.use('/inventory', inventory)
router.use('/dashboard', dashboard)
router.use('/store', store)
router.use('/backup', backup)
router.use('/export', exporter)
router.use('/payments', payments)

export default router