import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { listMembers, inviteMember } from '@/server/workspace/service'
import { ROLES, MSG } from '@/server/constants'

const inviteBody = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager']),
})

export const Route = createFileRoute('/api/workspaces/$wsId/members')({
  server: {
    handlers: {
      GET: handle(async ({ request, params }: { request: Request; params: { wsId: string } }) => {
        await requireMember(request, params.wsId)
        const data = await listMembers(params.wsId)
        return success(data, MSG.WORKSPACE.MEMBERS_FETCHED)
      }),
      POST: handle(async ({ request, params }: { request: Request; params: { wsId: string } }) => {
        await requireMember(request, params.wsId, ROLES.ADMIN)
        const { email, role } = inviteBody.parse(await request.json())
        const data = await inviteMember(params.wsId, email, role)
        return success(data, MSG.WORKSPACE.MEMBER_INVITED, 201)
      }),
    },
  },
})
