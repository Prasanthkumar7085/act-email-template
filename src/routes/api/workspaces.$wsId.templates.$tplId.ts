import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { getTemplate, updateTemplate, deleteTemplate } from '@/server/template/service'
import { MSG } from '@/server/constants'

const variableSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  defaultValue: z.string().default(''),
})

const updateBody = z.object({
  name: z.string().min(1).max(200).optional(),
  categoryId: z.string().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  subjectLine: z.string().max(500).nullable().optional(),
  editorData: z.record(z.unknown()).nullable().optional(),
  compiledHtml: z.string().nullable().optional(),
  variables: z.array(variableSchema).optional(),
  status: z.enum(['draft', 'published']).optional(),
})

type Params = { wsId: string; tplId: string }

export const Route = createFileRoute('/api/workspaces/$wsId/templates/$tplId')({
  server: {
    handlers: {
      GET: handle(async ({ request, params }: { request: Request; params: Params }) => {
        await requireMember(request, params.wsId)
        const data = await getTemplate(params.wsId, params.tplId)
        return success(data, MSG.TEMPLATE.FETCHED)
      }),
      PATCH: handle(async ({ request, params }: { request: Request; params: Params }) => {
        await requireMember(request, params.wsId)
        const input = updateBody.parse(await request.json())
        const data = await updateTemplate(params.wsId, params.tplId, input)
        return success(data, MSG.TEMPLATE.UPDATED)
      }),
      DELETE: handle(async ({ request, params }: { request: Request; params: Params }) => {
        await requireMember(request, params.wsId)
        const data = await deleteTemplate(params.wsId, params.tplId)
        return success(data, MSG.TEMPLATE.DELETED)
      }),
    },
  },
})
