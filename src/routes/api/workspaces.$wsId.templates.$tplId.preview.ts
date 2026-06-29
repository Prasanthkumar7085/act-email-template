import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { previewTemplate } from '@/server/template/service'
import { MSG } from '@/server/constants'

const body = z.object({
  variables: z.record(z.string()).default({}),
})

type Params = { wsId: string; tplId: string }

export const Route = createFileRoute('/api/workspaces/$wsId/templates/$tplId/preview')({
  server: {
    handlers: {
      POST: handle(async ({ request, params }: { request: Request; params: Params }) => {
        await requireMember(request, params.wsId)
        const { variables } = body.parse(await request.json())
        const data = await previewTemplate(params.wsId, params.tplId, variables)
        return success(data, MSG.TEMPLATE.PREVIEWED)
      }),
    },
  },
})
