import { createFileRoute } from '@tanstack/react-router'
import { handle, success } from '@/server/errors'
import { refreshTokens } from '@/server/auth/service'
import { AppError } from '@/server/errors'
import { attachCookies, buildAuthCookieHeaders, readAuthCookies } from '@/server/auth/cookies'
import { MSG } from '@/server/constants'

export const Route = createFileRoute('/api/auth/refresh')({
  server: {
    handlers: {
      POST: handle(async ({ request }: { request: Request }) => {
        const { refreshToken } = readAuthCookies(request)
        if (!refreshToken) throw AppError.unauthorized('No refresh token cookie')

        const tokens = await refreshTokens(refreshToken)
        const res = success({}, MSG.AUTH.TOKENS_REFRESHED)
        return attachCookies(res, buildAuthCookieHeaders(tokens.accessToken, tokens.refreshToken))
      }),
    },
  },
})
