import { Resend } from 'resend'
import { env } from '../env'

let cached: Resend | null = null

function client(): Resend | null {
  const key = env().RESEND_API_KEY
  if (!key) return null
  if (!cached) cached = new Resend(key)
  return cached
}

interface SendArgs {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendMail({ to, subject, html, text }: SendArgs): Promise<void> {
  const c = client()
  const from = env().EMAIL_FROM
  if (!c || !from) {
    console.log(`[mail] skipped (no Resend config) — would send to ${Array.isArray(to) ? to.join(',') : to}: ${subject}`)
    return
  }

  const { error } = await c.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    ...(text && { text }),
  })

  if (error) {
    console.error('[mail] send failed', error)
    throw new Error(typeof error === 'string' ? error : (error as { message?: string }).message ?? 'Failed to send email')
  }
}
