import { createFileRoute } from '@tanstack/react-router'
import { handle, success } from '@/server/errors'
import { clearAuthCookies } from '@/server/auth/cookies'
import { MSG } from '@/server/constants'

export const Route = createFileRoute('/api/auth/logout')({
  server: {
    handlers: {
      POST: handle(async () => {
        clearAuthCookies()
        return success({}, MSG.AUTH.LOGGED_OUT)
      }),
    },
  },
})
