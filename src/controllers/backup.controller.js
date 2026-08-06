import fs from 'fs'
import path from 'path'

const dbPath = path.join(import.meta.dirname, '..', '..', 'prisma', 'dev.db')
const backupDir = path.join(import.meta.dirname, '..', '..', 'backups')

export async function createBackup(req, res) {
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true })
  const date = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDir, `backup-${date}.db`)
  fs.copyFileSync(dbPath, backupPath)
  res.json({ success: true, filename: `backup-${date}.db` })
}

export async function listBackups(req, res) {
  if (!fs.existsSync(backupDir)) return res.json([])
  const files = fs.readdirSync(backupDir)
    .filter(f => f.endsWith('.db'))
    .map(f => ({ name: f, date: fs.statSync(path.join(backupDir, f)).mtime, size: fs.statSync(path.join(backupDir, f)).size }))
    .sort((a, b) => b.date - a.date)
  res.json(files)
}
