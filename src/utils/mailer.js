import { EMAILJS_CONFIG, RESET_TOKEN_EXPIRES_MINUTES } from '../config.js'

export async function sendResetPasswordEmail(to, nombre, resetLink) {
  if (!EMAILJS_CONFIG.serviceId || !EMAILJS_CONFIG.publicKey) {
    console.log('\n========== MODO DEV (sin EmailJS configurado) ==========')
    console.log(`Para: ${to} (${nombre})`)
    console.log(`Enlace: ${resetLink}`)
    console.log('=========================================================\n')
    return
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify({
      service_id: EMAILJS_CONFIG.serviceId,
      template_id: EMAILJS_CONFIG.templateId,
      user_id: EMAILJS_CONFIG.publicKey,
      accessToken: EMAILJS_CONFIG.privateKey,
      template_params: {
        to_name: nombre,
        to_email: to,
        reset_link: resetLink,
        expires_minutes: RESET_TOKEN_EXPIRES_MINUTES,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Error en EmailJS (${response.status}): ${errorText}`)
  }
}