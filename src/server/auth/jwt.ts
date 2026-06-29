import jwt from 'jsonwebtoken'
import { env } from '../env'
import { AppError } from '../errors'

interface SessionPayload {
  userId: string
}

interface JwtDecoded extends SessionPayload {
  iat: number
  exp: number
}

/** Session lifetime — long enough that no refresh dance is needed. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

export function signSession(userId: string): string {
  return jwt.sign({ userId } satisfies SessionPayload, env().JWT_SECRET, {
    expiresIn: SESSION_TTL_SECONDS,
  })
}

export function verifySession(token: string): SessionPayload {
  try {
    const decoded = jwt.verify(token, env().JWT_SECRET) as JwtDecoded
    return { userId: decoded.userId }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw AppError.tokenExpired()
    throw AppError.tokenInvalid()
  }
}
