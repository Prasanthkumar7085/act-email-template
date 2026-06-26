import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { getWorkspace, updateWorkspace, deleteWorkspace } from '@/server/workspace/service'
import { ROLES, MSG } from '@/server/constants'

const updateBody = z.object({
  name: z.string().min(2).max(100).optional(),
  logo: z.string().url().nullable().optional(),
  brandColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color')
    .nullable()
    .optional(),
  brandFont: z.string().max(100).nullable().optional(),
})

export const Route = createFileRoute('/api/workspaces/$wsId')({
  server: {
    handlers: {
      GET: handle(async ({ request, params }: { request: Request; params: { wsId: string } }) => {
        await requireMember(request, params.wsId)
        const data = await getWorkspace(params.wsId)
        return success(data, MSG.WORKSPACE.FETCHED)
      }),
      PATCH: handle(async ({ request, params }: { request: Request; params: { wsId: string } }) => {
        await requireMember(request, params.wsId, ROLES.ADMIN)
        const input = updateBody.parse(await request.json())
        const data = await updateWorkspace(params.wsId, input)
        return success(data, MSG.WORKSPACE.UPDATED)
      }),
      DELETE: handle(async ({ request, params }: { request: Request; params: { wsId: string } }) => {
        await requireMember(request, params.wsId, ROLES.OWNER)
        const data = await deleteWorkspace(params.wsId)
        return success(data, MSG.WORKSPACE.DELETED)
      }),
    },
  },
})
