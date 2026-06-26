import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success, jsonResponse } from '@/server/errors'
import { verifyOtp } from '@/server/auth/service'
import { attachCookies, buildAuthCookieHeaders } from '@/server/auth/cookies'
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

        if (result.isNewUser) {
          // Don't set auth cookies for new users — they still need to register
          return success(
            { isNewUser: true, registrationToken: result.registrationToken },
            MSG.AUTH.OTP_VERIFIED,
          )
        }

        const res = success(
          { isNewUser: false, user: result.user },
          MSG.AUTH.OTP_VERIFIED,
        )
        return attachCookies(res, buildAuthCookieHeaders(result.accessToken, result.refreshToken))
      }),
    },
  },
})
