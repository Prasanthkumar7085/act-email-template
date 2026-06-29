import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { listTemplates, createTemplate } from '@/server/template/service'
import { MSG } from '@/server/constants'

const variableSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  defaultValue: z.string().default(''),
})

const createBody = z.object({
  name: z.string().min(1).max(200),
  categoryId: z.string().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  subjectLine: z.string().max(500).nullable().optional(),
  editorData: z.record(z.unknown()).nullable().optional(),
  compiledHtml: z.string().nullable().optional(),
  variables: z.array(variableSchema).optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export const Route = createFileRoute('/api/workspaces/$wsId/templates')({
  server: {
    handlers: {
      GET: handle(async ({ request, params }: { request: Request; params: { wsId: string } }) => {
        await requireMember(request, params.wsId)
        const url = new URL(request.url)
        const filters = {
          category: url.searchParams.get('category') ?? undefined,
          status: (url.searchParams.get('status') as 'draft' | 'published' | null) ?? undefined,
          search: url.searchParams.get('search') ?? undefined,
          page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : undefined,
          limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined,
        }
        const { items, meta } = await listTemplates(params.wsId, filters)
        return success(items, MSG.TEMPLATE.LIST_FETCHED, 200, meta)
      }),
      POST: handle(async ({ request, params }: { request: Request; params: { wsId: string } }) => {
        const { userId } = await requireMember(request, params.wsId)
        const input = createBody.parse(await request.json())
        const data = await createTemplate(params.wsId, userId, input)
        return success(data, MSG.TEMPLATE.CREATED, 201)
      }),
    },
  },
})
