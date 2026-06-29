import { createFileRoute } from '@tanstack/react-router'
import { handle, success } from '@/server/errors'
import { requireMember } from '@/server/auth/guards'
import { copyFromGallery } from '@/server/template/service'
import { MSG } from '@/server/constants'

type Params = { wsId: string; predefinedId: string }

export const Route = createFileRoute('/api/workspaces/$wsId/templates/from-gallery/$predefinedId')({
  server: {
    handlers: {
      POST: handle(async ({ request, params }: { request: Request; params: Params }) => {
        const { userId } = await requireMember(request, params.wsId)
        const data = await copyFromGallery(params.wsId, userId, params.predefinedId)
        return success(data, MSG.TEMPLATE.COPIED_FROM_GALLERY, 201)
      }),
    },
  },
})
