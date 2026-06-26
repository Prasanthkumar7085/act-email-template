import { createFileRoute } from '@tanstack/react-router'
import { handle, success } from '@/server/errors'
import { requireUser } from '@/server/auth/guards'
import { acceptInvite } from '@/server/workspace/service'
import { MSG } from '@/server/constants'

export const Route = createFileRoute('/api/invites/$token/accept')({
  server: {
    handlers: {
      POST: handle(async ({ request, params }: { request: Request; params: { token: string } }) => {
        const { userId } = await requireUser(request)
        const data = await acceptInvite(params.token, userId)
        return success(data, MSG.WORKSPACE.INVITE_ACCEPTED)
      }),
    },
  },
})
