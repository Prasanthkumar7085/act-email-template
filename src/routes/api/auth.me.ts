import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success } from '@/server/errors'
import { requireUser } from '@/server/auth/guards'
import { getMe, updateMe } from '@/server/auth/service'
import { MSG } from '@/server/constants'

const patchBody = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
})

export const Route = createFileRoute('/api/auth/me')({
  server: {
    handlers: {
      GET: handle(async ({ request }: { request: Request }) => {
        const { userId } = await requireUser(request)
        const data = await getMe(userId)
        return success(data, MSG.AUTH.PROFILE_FETCHED)
      }),
      PATCH: handle(async ({ request }: { request: Request }) => {
        const { userId } = await requireUser(request)
        const input = patchBody.parse(await request.json())
        const data = await updateMe(userId, input)
        return success(data, MSG.AUTH.PROFILE_UPDATED)
      }),
    },
  },
})
