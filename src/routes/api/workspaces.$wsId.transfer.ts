import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { transferOwnership } from '@/server/workspace/service'
import { ROLES, MSG } from '@/server/constants'

const body = z.object({ newOwnerId: z.string().min(1) })

export const Route = createFileRoute('/api/workspaces/$wsId/transfer')({
  server: {
    handlers: {
      POST: handle(async ({ request, params }: { request: Request; params: { wsId: string } }) => {
        const ctx = await requireMember(request, params.wsId, ROLES.OWNER)
        const { newOwnerId } = body.parse(await request.json())
        const data = await transferOwnership(params.wsId, newOwnerId, ctx.userId)
        return success(data, MSG.WORKSPACE.OWNERSHIP_TRANSFERRED)
      }),
    },
  },
})
