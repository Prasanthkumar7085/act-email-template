import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),

  MONGODB_URI: z.string().url(),

  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  OTP_EXPIRY_MINUTES: z.coerce.number().default(5),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(3),
  OTP_HOURLY_LIMIT: z.coerce.number().default(10),

  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),

  APP_URL: z.string().url().default('http://localhost:3000'),
})

let cached: z.infer<typeof envSchema> | null = null

export function env() {
  if (cached) return cached

  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Invalid environment variables:\n${issues}`)
  }

  cached = parsed.data
  return cached
}

export const isProd = () => env().NODE_ENV === 'production'
