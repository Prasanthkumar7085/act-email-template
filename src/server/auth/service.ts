import { connectMongo } from '../db/mongo'
import { User } from '../db/models/user'
import { AppError } from '../errors'
import { signSession } from './jwt'
import { createWorkspace } from '../workspace/service'

const DEV_OTP_CODE = '123456'

function sanitizeUser(u: any) {
  return {
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    phone: u.phone ?? null,
    avatar: u.avatar ?? null,
    status: u.status,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }
}

// ── sendOtp ─────────────────────────────────────────────────────────
// Dev-only flow: confirm the email is in our DB, log a hint to the console.
// No OTP is generated, stored, or emailed — verifyOtp accepts the fixed
// DEV_OTP_CODE for any existing user.

export async function sendOtp(email: string) {
  await connectMongo()

  const existing = await User.findOne({ email }).lean()
  if (!existing) throw AppError.notFound('User', email)

  console.log(`[otp] dev login code for ${email} → ${DEV_OTP_CODE}`)
  return { message: `OTP sent (dev mode — use ${DEV_OTP_CODE})` }
}

// ── verifyOtp ───────────────────────────────────────────────────────
// Accepts the fixed DEV_OTP_CODE. Returns the user + a freshly signed
// session token so the route handler can set the cookie.

export async function verifyOtp(email: string, code: string) {
  await connectMongo()

  if (code !== DEV_OTP_CODE) {
    throw AppError.badRequest('OTP_INVALID', 'Invalid OTP code')
  }

  const existing = await User.findOne({ email }).lean()
  if (!existing) throw AppError.notFound('User', email)

  await User.updateOne({ _id: existing._id }, { lastLoginAt: new Date(), isVerified: true })

  return {
    user: sanitizeUser(existing),
    sessionToken: signSession(existing._id.toString()),
  }
}

// ── register ────────────────────────────────────────────────────────
// Direct sign-up (no OTP step required in dev mode). Creates the user
// and an owner workspace, then mints a session token.

export async function register(name: string, email: string, workspaceName: string) {
  await connectMongo()

  const existing = await User.findOne({ email }).lean()
  if (existing) throw AppError.conflict('EMAIL_ALREADY_EXISTS', 'A user with this email already exists')

  const user = await User.create({
    name,
    email,
    isVerified: true,
    status: 'active',
    lastLoginAt: new Date(),
  })

  const workspace = await createWorkspace(user._id.toString(), workspaceName)

  return {
    user: sanitizeUser(user.toObject()),
    workspace: {
      _id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
    },
    sessionToken: signSession(user._id.toString()),
  }
}

// ── me / update ─────────────────────────────────────────────────────

export async function getMe(userId: string) {
  await connectMongo()
  const user = await User.findById(userId).lean()
  if (!user) throw AppError.notFound('User')
  return sanitizeUser(user)
}

export async function updateMe(
  userId: string,
  data: { name?: string; phone?: string; avatar?: string },
) {
  await connectMongo()
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: data },
    { new: true, runValidators: true },
  ).lean()
  if (!user) throw AppError.notFound('User')
  return sanitizeUser(user)
}
