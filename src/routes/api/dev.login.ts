import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { handle, success, AppError } from '@/server/errors'
import { env } from '@/server/env'
import { connectMongo } from '@/server/db/mongo'
import { User } from '@/server/db/models/user'
import { signSession } from '@/server/auth/jwt'
import { setSessionCookie } from '@/server/auth/cookies'

const body = z.object({ email: z.string().email() })

export const Route = createFileRoute('/api/dev/login')({
  server: {
    handlers: {
      POST: handle(async ({ request }: { request: Request }) => {
        if (env().NODE_ENV === 'production') {
          throw AppError.forbidden('Dev login is disabled in production')
        }

        const { email } = body.parse(await request.json())
        await connectMongo()

        const user = await User.findOne({ email })
        if (!user) throw AppError.notFound('User', email)
        if (user.status !== 'active') {
          throw AppError.badRequest('ACCOUNT_SUSPENDED', 'Account is suspended')
        }

        await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() })

        setSessionCookie(signSession(user._id.toString()))

        return success(
          {
            user: {
              _id: user._id.toString(),
              name: user.name,
              email: user.email,
              avatar: user.avatar,
            },
          },
          `Logged in as ${user.email}`,
        )
      }),
    },
  },
})
