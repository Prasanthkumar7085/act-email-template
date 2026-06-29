import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { exportTemplate } from '@/server/template/service'
import { MSG } from '@/server/constants'

const body = z.object({
  format: z.enum(['ejs', 'mjml', 'html']),
  variables: z.record(z.string()).optional(),
})

type Params = { wsId: string; tplId: string }

export const Route = createFileRoute('/api/workspaces/$wsId/templates/$tplId/export')({
  server: {
    handlers: {
      POST: handle(async ({ request, params }: { request: Request; params: Params }) => {
        await requireMember(request, params.wsId)
        const { format, variables } = body.parse(await request.json())
        const data = await exportTemplate(params.wsId, params.tplId, format, variables)
        return success(data, MSG.TEMPLATE.EXPORTED)
      }),
    },
  },
})
