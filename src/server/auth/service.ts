import { nanoid } from 'nanoid'
import { connectMongo } from '../db/mongo'
import { User } from '../db/models/user'
import { Otp } from '../db/models/otp'
import { RegistrationToken } from '../db/models/registrationToken'
import { env } from '../env'
import { AppError } from '../errors'
import { signAccessToken, signRefreshToken, verifyRefreshToken, revokeRefreshToken } from './jwt'
import { generateOtp, hashOtp, compareOtp, enforceOtpRateLimit } from './otp'
import { sendMail } from '../mail/send'
import { createWorkspace } from '../workspace/service'

interface AuthTokens {
  accessToken: string
  refreshToken: string
}

async function issueTokens(userId: string): Promise<AuthTokens> {
  return {
    accessToken: signAccessToken(userId),
    refreshToken: await signRefreshToken(userId),
  }
}

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

export async function sendOtp(email: string) {
  await connectMongo()
  await enforceOtpRateLimit(email)
  await Otp.deleteMany({ email })

  const code = generateOtp()
  const hashedCode = await hashOtp(code)

  const existing = await User.findOne({ email }).lean()
  const purpose: 'login' | 'register' = existing ? 'login' : 'register'

  await Otp.create({
    email,
    code: hashedCode,
    purpose,
    expiresAt: new Date(Date.now() + env().OTP_EXPIRY_MINUTES * 60 * 1000),
  })

  if (env().NODE_ENV !== 'production') {
    console.log(`[otp] ${email} → ${code}`)
  }

  await sendMail({
    to: email,
    subject: 'Your Mailix verification code',
    html: `
      <p>Your Mailix verification code is:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px;">${code}</p>
      <p>It expires in ${env().OTP_EXPIRY_MINUTES} minutes.</p>
      <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore it.</p>
    `,
  })

  return { message: 'OTP sent' }
}

// ── verifyOtp ───────────────────────────────────────────────────────

export async function verifyOtp(email: string, code: string) {
  await connectMongo()

  const otp = await Otp.findOne({ email }).sort({ createdAt: -1 })
  if (!otp) throw AppError.badRequest('OTP_EXPIRED', 'OTP has expired or was not found')

  if (otp.attempts >= env().OTP_MAX_ATTEMPTS) {
    throw AppError.badRequest('OTP_MAX_ATTEMPTS', 'Maximum OTP attempts exceeded. Request a new code.')
  }

  otp.attempts += 1
  await otp.save()

  const valid = await compareOtp(code, otp.code)
  if (!valid) throw AppError.badRequest('OTP_INVALID', 'Invalid OTP code')

  await otp.deleteOne()

  const existing = await User.findOne({ email }).lean()

  if (existing) {
    await User.updateOne({ _id: existing._id }, { lastLoginAt: new Date(), isVerified: true })
    const tokens = await issueTokens(existing._id.toString())
    return {
      isNewUser: false as const,
      user: sanitizeUser(existing),
      ...tokens,
    }
  }

  const token = nanoid(32)
  await RegistrationToken.create({
    token,
    email,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  })

  return { isNewUser: true as const, registrationToken: token }
}

// ── register ────────────────────────────────────────────────────────

export async function register(
  registrationToken: string,
  name: string,
  email: string,
  workspaceName: string,
) {
  await connectMongo()

  const tokenDoc = await RegistrationToken.findOne({
    token: registrationToken,
    expiresAt: { $gt: new Date() },
  })

  if (!tokenDoc) throw AppError.tokenInvalid('Registration token is invalid or expired')
  if (tokenDoc.email !== email) throw AppError.tokenInvalid('Email does not match registration token')

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

  await tokenDoc.deleteOne()

  const tokens = await issueTokens(user._id.toString())

  return {
    user: sanitizeUser(user.toObject()),
    workspace: {
      _id: workspace._id.toString(),
      name: workspace.name,
      slug: workspace.slug,
    },
    ...tokens,
  }
}

// ── refresh / logout / me ───────────────────────────────────────────

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  await connectMongo()
  const userId = await verifyRefreshToken(refreshToken)
  const user = await User.findById(userId).lean()
  if (!user) throw AppError.unauthorized('User not found')
  if (user.status !== 'active') {
    throw AppError.badRequest('ACCOUNT_SUSPENDED', 'Your account has been suspended')
  }
  return issueTokens(userId)
}

export async function logout(refreshToken: string | null) {
  if (refreshToken) await revokeRefreshToken(refreshToken)
  return { message: 'Logged out' }
}

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
