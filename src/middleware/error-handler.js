export function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message || err)
  if (err.code === 'P2002') return res.status(400).json({ error: 'Ya existe un registro con ese valor único' })
  if (err.code === 'P2025') return res.status(404).json({ error: 'Registro no encontrado' })
  res.status(500).json({ error: 'Error interno del servidor' })
}
