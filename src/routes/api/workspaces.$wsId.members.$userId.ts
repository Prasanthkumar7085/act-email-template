import { createFileRoute } from '@tanstack/react-router'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { removeMember } from '@/server/workspace/service'
import { ROLES, MSG } from '@/server/constants'

export const Route = createFileRoute('/api/workspaces/$wsId/members/$userId')({
  server: {
    handlers: {
      DELETE: handle(
        async ({ request, params }: { request: Request; params: { wsId: string; userId: string } }) => {
          const ctx = await requireMember(request, params.wsId, ROLES.ADMIN)
          const data = await removeMember(params.wsId, params.userId, ctx.role)
          return success(data, MSG.WORKSPACE.MEMBER_REMOVED)
        },
      ),
    },
  },
})
