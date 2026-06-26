import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { changeRole } from '@/server/workspace/service'
import { ROLES, MSG } from '@/server/constants'

const body = z.object({ role: z.enum(['admin', 'manager']) })

export const Route = createFileRoute('/api/workspaces/$wsId/members/$userId/role')({
  server: {
    handlers: {
      PATCH: handle(
        async ({ request, params }: { request: Request; params: { wsId: string; userId: string } }) => {
          const ctx = await requireMember(request, params.wsId, ROLES.OWNER)
          const { role } = body.parse(await request.json())
          const data = await changeRole(params.wsId, params.userId, role, ctx.userId)
          return success(data, MSG.WORKSPACE.ROLE_CHANGED)
        },
      ),
    },
  },
})
