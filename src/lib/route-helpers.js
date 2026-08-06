import { Router } from 'express'

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}

export function sanitizeString(str) {
  if (typeof str !== 'string') return str
  return str.replace(/[<>]/g, '')
}

export function pick(obj, keys) {
  const result = {}
  for (const key of keys) {
    if (obj[key] !== undefined) result[key] = obj[key]
  }
  return result
}

export function crudRoutes(prisma, model, opts = {}) {
  const router = Router()
  const db = prisma[model]
  const { include, orderBy, auth, createFields, updateFields, sanitize, onDelete } = opts

  router.get('/', asyncHandler(async (req, res) => {
    res.json(await db.findMany({ include, orderBy: orderBy || { createdAt: 'desc' } }))
  }))

  if (auth?.create) {
    router.post('/', auth.create, asyncHandler(async (req, res) => {
      const data = {}
      for (const f of (createFields || [])) {
        if (req.body[f] !== undefined) {
          data[f] = sanitize?.includes(f) ? sanitizeString(req.body[f]) : req.body[f]
        }
      }
      res.json(await db.create({ data, include }))
    }))
  }

  if (auth?.update) {
    router.put('/:id', auth.update, asyncHandler(async (req, res) => {
      const data = pick(req.body, updateFields || createFields || [])
      for (const f of (sanitize || [])) {
        if (data[f]) data[f] = sanitizeString(data[f])
      }
      res.json(await db.update({ where: { id: req.params.id }, data, include }))
    }))
  }

  if (auth?.delete) {
    router.delete('/:id', auth.delete, asyncHandler(async (req, res) => {
      if (onDelete) await onDelete(req.params.id, prisma)
      await db.delete({ where: { id: req.params.id } })
      res.json({ success: true })
    }))
  }

  return router
}
