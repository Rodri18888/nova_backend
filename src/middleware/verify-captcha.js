import 'dotenv/config'

const SECRET = process.env.RECAPTCHA_SECRET_KEY
const URL = 'https://www.google.com/recaptcha/api/siteverify'

export async function verifyCaptcha(req, res, next) {
  if (!SECRET) return next()
  const token = req.body.captchaToken
  if (!token) return res.status(400).json({ error: 'Falta el captcha' })
  try {
    const form = new URLSearchParams({ secret: SECRET, response: token })
    const resp = await fetch(URL, { method: 'POST', body: form })
    const data = await resp.json()
    if (!data.success) return res.status(400).json({ error: 'Captcha inválido' })
    next()
  } catch {
    return res.status(500).json({ error: 'Error al verificar el captcha' })
  }
}