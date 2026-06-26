import { createFileRoute } from '@tanstack/react-router'
import { handle, success } from '@/server/errors'
import { logout } from '@/server/auth/service'
import { attachCookies, buildClearAuthCookieHeaders, readAuthCookies } from '@/server/auth/cookies'
import { MSG } from '@/server/constants'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: handle(async ({ request }: { request: Request }) => {
        const { refreshToken } = readAuthCookies(request)
        await logout(refreshToken)
        const res = success({}, MSG.AUTH.LOGGED_OUT)
        return attachCookies(res, buildClearAuthCookieHeaders())
      }),
    },
  },
})
