import bcrypt from 'bcryptjs'
import { env } from '../env'
import { AppError } from '../errors'
import { OtpRateLimit } from '../db/models/otpRateLimit'

const SALT_ROUNDS = 10

export function generateOtp(): string {
  return Math.floor(100_000 + Math.random() * 900_000).toString()
}

export function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, SALT_ROUNDS)
}

export function compareOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash)
}

/**
 * Enforce a 1-hour rolling window of OTP_HOURLY_LIMIT sends per email.
 * Throws AppError.rateLimited when exceeded.
 */
export async function enforceOtpRateLimit(email: string): Promise<void> {
  const now = new Date()
  const limit = env().OTP_HOURLY_LIMIT

  const doc = await OtpRateLimit.findOneAndUpdate(
    { email },
    [
      {
        $set: {
          email,
          count: {
            $cond: [
              { $gt: ['$expiresAt', now] },
              { $add: [{ $ifNull: ['$count', 0] }, 1] },
              1,
            ],
          },
          expiresAt: {
            $cond: [
              { $gt: ['$expiresAt', now] },
              '$expiresAt',
              new Date(now.getTime() + 60 * 60 * 1000),
            ],
          },
        },
      },
    ],
    { upsert: true, new: true },
  )

  if (doc.count > limit) {
    throw AppError.rateLimited('Too many OTP requests. Try again in an hour.')
  }
}
