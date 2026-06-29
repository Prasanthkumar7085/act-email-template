import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { register } from '@/server/auth/service'
import { setSessionCookie, setWorkspaceCookie } from '@/server/auth/cookies'
import { MSG } from '@/server/constants'

const body = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  workspaceName: z.string().min(2),
})

export const Route = createFileRoute('/api/auth/register')({
  server: {
    handlers: {
      POST: handle(async ({ request }: { request: Request }) => {
        const { name, email, workspaceName } = body.parse(await request.json())
        const result = await register(name, email, workspaceName)
        setSessionCookie(result.sessionToken)
        setWorkspaceCookie(result.workspace._id)
        return success(
          { user: result.user, workspace: result.workspace },
          MSG.AUTH.REGISTERED,
          201,
        )
      }),
    },
  },
})
