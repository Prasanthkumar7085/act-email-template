import { createFileRoute } from '@tanstack/react-router'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { duplicateTemplate } from '@/server/template/service'
import { MSG } from '@/server/constants'

type Params = { wsId: string; tplId: string }

export const Route = createFileRoute('/api/workspaces/$wsId/templates/$tplId/duplicate')({
  server: {
    handlers: {
      POST: handle(async ({ request, params }: { request: Request; params: Params }) => {
        const { userId } = await requireMember(request, params.wsId)
        const data = await duplicateTemplate(params.wsId, userId, params.tplId)
        return success(data, MSG.TEMPLATE.DUPLICATED, 201)
      }),
    },
  },
})
