import fs from 'fs'
import path from 'path'
import { sanitizeString } from '../lib/route-helpers.js'
import { STORE_CONFIG_FIELDS, DEFAULT_STORE_CONFIG } from '../config.js'

const configPath = path.join(import.meta.dirname, '..', '..', 'store-config.json')

export async function getConfig(req, res) {
  if (fs.existsSync(configPath)) {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    const safe = {}
    for (const key of STORE_CONFIG_FIELDS) if (raw[key] !== undefined) safe[key] = raw[key]
    res.json(safe)
  } else {
    res.json(DEFAULT_STORE_CONFIG)
  }
}

export async function updateConfig(req, res) {
  const safe = {}
  for (const key of STORE_CONFIG_FIELDS) {
    if (req.body[key] !== undefined) safe[key] = typeof req.body[key] === 'string' ? sanitizeString(req.body[key]) : req.body[key]
  }
  fs.writeFileSync(configPath, JSON.stringify(safe, null, 2))
  res.json({ success: true })
}
