import nodemailer from 'nodemailer'
import { SMTP_CONFIG, MAIL_FROM, RESET_TOKEN_EXPIRES_MINUTES } from '../config.js'

const transporter = SMTP_CONFIG.host
  ? nodemailer.createTransport({
      host: SMTP_CONFIG.host,
      port: SMTP_CONFIG.port,
      secure: SMTP_CONFIG.secure,
      auth: SMTP_CONFIG.user ? { user: SMTP_CONFIG.user, pass: SMTP_CONFIG.pass } : undefined,
    })
  : null

export async function sendMail({ to, subject, html, text }) {
  if (!transporter) {
    console.log('\n========== MODO DEV (sin SMTP configurado) ==========')
    console.log(`Para: ${to}`)
    console.log(`Asunto: ${subject}`)
    if (text) console.log(text)
    else console.log(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
    console.log('=====================================================\n')
    return
  }
  await transporter.sendMail({ from: MAIL_FROM, to, subject, html })
}

export async function sendResetPasswordEmail(to, nombre, resetLink) {
  await sendMail({
    to,
    subject: 'Recuperar contraseña - NOVA',
    text: `Hola ${nombre}. Recibimos una solicitud para restablecer tu contraseña en NOVA. Abre este enlace (expira en ${RESET_TOKEN_EXPIRES_MINUTES} minutos): ${resetLink}\n\nSi no solicitaste esto, ignora este mensaje.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #111827;">Hola ${nombre},</h2>
        <p style="color: #374151; font-size: 14px;">
          Recibimos una solicitud para restablecer tu contraseña en <strong>NOVA</strong>.
          Haz clic en el siguiente botón (expira en ${RESET_TOKEN_EXPIRES_MINUTES} minutos):
        </p>
        <p style="text-align: center; margin: 28px 0;">
          <a href="${resetLink}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: bold;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
          <span style="color: #7c3aed;">${resetLink}</span>
        </p>
        <p style="color: #6b7280; font-size: 12px;">
          Si no solicitaste esto, ignora este correo y tu contraseña seguirá siendo la misma.
        </p>
      </div>
    `,
  })
}
