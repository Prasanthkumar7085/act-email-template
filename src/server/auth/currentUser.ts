import { createServerFn } from '@tanstack/react-start'
import { getWebRequest } from '@tanstack/react-start/server'
import { requireUser } from './guards'

export interface SerializedUser {
  _id: string
  name: string
  email: string
  avatar: string | null
  phone: string | null
  status: string
}

/**
 * Server function: returns the current user (or null) based on the
 * httpOnly access-token cookie on the incoming SSR request.
 */
export const loadCurrentUser = createServerFn({ method: 'GET' }).handler(
  async (): Promise<SerializedUser | null> => {
    try {
      const request = getWebRequest()
      if (!request) return null
      const { user } = await requireUser(request)
      return {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        status: user.status,
      }
    } catch {
      return null
    }
  },
)
