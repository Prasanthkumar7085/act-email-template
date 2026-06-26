import { Resend } from 'resend'
import { env } from '../env'

let cached: Resend | null = null

function client() {
  if (!cached) cached = new Resend(env().RESEND_API_KEY)
  return cached
}

interface SendArgs {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export async function sendMail({ to, subject, html, text }: SendArgs): Promise<void> {
  const { error } = await client().emails.send({
    from: env().EMAIL_FROM,
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
