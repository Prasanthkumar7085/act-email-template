import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { sendOtp } from '@/server/auth/service'
import { MSG } from '@/server/constants'

const body = z.object({ email: z.string().email() })

export const Route = createFileRoute('/api/auth/otp/send')({
  server: {
    handlers: {
      POST: handle(async ({ request }: { request: Request }) => {
        const { email } = body.parse(await request.json())
        const data = await sendOtp(email)
        return success(data, MSG.AUTH.OTP_SENT)
      }),
    },
  },
})
