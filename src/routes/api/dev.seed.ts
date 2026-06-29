import { createFileRoute } from '@tanstack/react-router'
import { handle, success, AppError, jsonResponse } from '@/server/errors'
import { env } from '@/server/env'
import { seedDatabase } from '@/server/dev/seed'

export const Route = createFileRoute('/api/dev/seed')({
  server: {
    handlers: {
      POST: handle(async ({ request }: { request: Request }) => {
        if (env().NODE_ENV === 'production') {
          throw AppError.forbidden('Seeding is disabled in production')
        }

        const url = new URL(request.url)
        const reset = url.searchParams.get('reset') === 'true'

        const result = await seedDatabase({ reset })
        return success(result, reset ? 'Database reset and seeded' : 'Database seeded')
      }),
      GET: () =>
        jsonResponse(
          {
            usage: 'POST /api/dev/seed[?reset=true] — only enabled when NODE_ENV != production',
            note: 'reset=true wipes users/workspaces/members/otps/tokens before inserting',
          },
          200,
        ),
    },
  },
})
