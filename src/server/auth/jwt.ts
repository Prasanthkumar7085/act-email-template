import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { env } from '../env'
import { AppError } from '../errors'
import { RefreshToken } from '../db/models/refreshToken'

interface AccessTokenPayload {
  userId: string
}

interface JwtDecoded extends AccessTokenPayload {
  iat: number
  exp: number
}

export function durationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/)
  if (!match) throw new Error(`Invalid duration format: '${duration}'`)
  const value = parseInt(match[1], 10)
  const unit = match[2]
  switch (unit) {
    case 's': return value
    case 'm': return value * 60
    case 'h': return value * 3600
    case 'd': return value * 86400
    default:  return value
  }
}

export function signAccessToken(userId: string): string {
  return jwt.sign({ userId } satisfies AccessTokenPayload, env().JWT_SECRET, {
    expiresIn: durationToSeconds(env().JWT_ACCESS_EXPIRY),
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env().JWT_SECRET) as JwtDecoded
    return { userId: decoded.userId }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw AppError.tokenExpired()
    throw AppError.tokenInvalid()
  }
}

export async function signRefreshToken(userId: string): Promise<string> {
  const token = nanoid(48)
  const ttl = durationToSeconds(env().JWT_REFRESH_EXPIRY)
  await RefreshToken.create({
    token,
    userId,
    expiresAt: new Date(Date.now() + ttl * 1000),
  })
  return token
}

/**
 * Verify a refresh token. Returns userId on success.
 * Deletes the token on use (one-time use / rotation).
 */
export async function verifyRefreshToken(token: string): Promise<string> {
  const doc = await RefreshToken.findOneAndDelete({ token, expiresAt: { $gt: new Date() } })
  if (!doc) {
    throw AppError.badRequest('REFRESH_TOKEN_INVALID', 'Refresh token is invalid or expired')
  }
  return doc.userId.toString()
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await RefreshToken.deleteOne({ token })
}
