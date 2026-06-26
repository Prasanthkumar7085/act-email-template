import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { register } from '@/server/auth/service'
import { attachCookies, buildAuthCookieHeaders, buildWorkspaceCookieHeader } from '@/server/auth/cookies'
import { MSG } from '@/server/constants'

const body = z.object({
  registrationToken: z.string().min(1),
  name: z.string().min(2),
  email: z.string().email(),
  workspaceName: z.string().min(2),
})

export const Route = createFileRoute('/api/auth/register')({
  server: {
    handlers: {
      POST: handle(async ({ request }: { request: Request }) => {
        const { registrationToken, name, email, workspaceName } = body.parse(await request.json())
        const result = await register(registrationToken, name, email, workspaceName)

        const res = success(
          { user: result.user, workspace: result.workspace },
          MSG.AUTH.REGISTERED,
          201,
        )
        return attachCookies(res, [
          ...buildAuthCookieHeaders(result.accessToken, result.refreshToken),
          buildWorkspaceCookieHeader(result.workspace._id),
        ])
      }),
    },
  },
})
