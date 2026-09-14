import logger from '../utils/logger.js'

export function errorHandler(err, req, res, next) {
  const message = `${req.method} ${req.path}: ${err.message || err}`
  if (err.stack) logger.error(message, { stack: err.stack })
  else logger.error(message)
  if (err.code === 'P2002') return res.status(400).json({ error: 'Ya existe un registro con ese valor único' })
  if (err.code === 'P2025') return res.status(404).json({ error: 'Registro no encontrado' })
  res.status(500).json({ error: 'Error interno del servidor' })
}
