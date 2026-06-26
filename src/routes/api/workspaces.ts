import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireUser } from '@/server/auth/guards'
import { listMyWorkspaces, createWorkspace } from '@/server/workspace/service'
import { MSG } from '@/server/constants'

const createBody = z.object({ name: z.string().min(2).max(100) })

export const Route = createFileRoute('/api/workspaces')({
  server: {
    handlers: {
      GET: handle(async ({ request }: { request: Request }) => {
        const { userId } = await requireUser(request)
        const data = await listMyWorkspaces(userId)
        return success(data, MSG.WORKSPACE.LIST_FETCHED)
      }),
      POST: handle(async ({ request }: { request: Request }) => {
        const { userId } = await requireUser(request)
        const { name } = createBody.parse(await request.json())
        const ws = await createWorkspace(userId, name)
        return success(
          {
            _id: ws._id.toString(),
            name: ws.name,
            slug: ws.slug,
            plan: ws.plan,
            maxMembers: ws.maxMembers,
            maxTemplates: ws.maxTemplates,
            status: ws.status,
            createdAt: ws.createdAt,
            updatedAt: ws.updatedAt,
          },
          MSG.WORKSPACE.CREATED,
          201,
        )
      }),
    },
  },
})
