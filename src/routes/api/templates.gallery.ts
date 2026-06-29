import { createFileRoute } from '@tanstack/react-router'
import { handle, success } from '@/server/errors'
import { requireUser } from '@/server/auth/guards'
import { listGallery } from '@/server/template/service'
import { MSG } from '@/server/constants'

export const Route = createFileRoute('/api/templates/gallery')({
  server: {
    handlers: {
      GET: handle(async ({ request }: { request: Request }) => {
        await requireUser(request)
        const url = new URL(request.url)
        const category = url.searchParams.get('category') ?? undefined
        const data = await listGallery(category)
        return success(data, MSG.TEMPLATE.GALLERY_FETCHED)
      }),
    },
  },
})
