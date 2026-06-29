import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { verifyOtp } from '@/server/auth/service'
import { setSessionCookie } from '@/server/auth/cookies'
import { MSG } from '@/server/constants'

const body = z.object({
  email: z.string().email(),
  code: z.string().length(6),
})

export const Route = createFileRoute('/api/auth/otp/verify')({
  server: {
    handlers: {
      POST: handle(async ({ request }: { request: Request }) => {
        const { email, code } = body.parse(await request.json())
        const result = await verifyOtp(email, code)
        setSessionCookie(result.sessionToken)
        return success({ user: result.user }, MSG.AUTH.OTP_VERIFIED)
      }),
    },
  },
})
