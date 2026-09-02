import { AsyncLocalStorage } from 'node:async_hooks'
import { PrismaClient } from '@prisma/client'

export const storeContext = new AsyncLocalStorage()

export function runWithStore(storeId, fn) {
  return storeContext.run(storeId, fn)
}

const TENANT_MODELS = new Set([
  'User', 'Product', 'Customer', 'Sale', 'SaleItem',
  'Devolution', 'DevolutionItem', 'Supplier', 'Purchase', 'PurchaseItem',
  'CashRegister', 'CashMovement', 'InventoryMovement',
])

const WHERE_OPS = new Set([
  'findMany', 'findFirst', 'findFirstOrThrow', 'findUnique', 'findUniqueOrThrow',
  'count', 'aggregate', 'groupBy', 'update', 'updateMany', 'delete', 'deleteMany',
])

function injectStoreIdIntoData(data, storeId) {
  if (Array.isArray(data)) return data.map((x) => injectStoreIdIntoData(x, storeId))
  if (data && typeof data === 'object') {
    const out = { ...data }
    if ('create' in out) {
      out.create = Array.isArray(out.create)
        ? out.create.map((row) => injectStoreIdIntoData({ ...row, storeId }, storeId))
        : injectStoreIdIntoData({ ...out.create, storeId }, storeId)
    }
    for (const [key, value] of Object.entries(out)) {
      if (key === 'create') continue
      if (value && typeof value === 'object') out[key] = injectStoreIdIntoData(value, storeId)
    }
    return out
  }
  return data
}

export const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const storeId = storeContext.getStore() || null
        if (!storeId || !TENANT_MODELS.has(model)) return query(args)

        if (WHERE_OPS.has(operation)) {
          args.where = { ...(args.where || {}), storeId }
        }
        if (operation === 'create' && args?.data) {
          const effective = args.data.storeId || storeId
          args.data = { ...injectStoreIdIntoData(args.data, effective), storeId: effective }
        }
        if (operation === 'createMany' && Array.isArray(args?.data)) {
          args.data = args.data.map((r) => ({ ...r, storeId }))
        }
        return query(args)
      },
    },
  },
})