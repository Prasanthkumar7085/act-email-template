import { connectMongo } from '../db/mongo'
import { User } from '../db/models/user'
import { Workspace } from '../db/models/workspace'
import { WorkspaceMember } from '../db/models/member'
import { Otp } from '../db/models/otp'
import { OtpRateLimit } from '../db/models/otpRateLimit'
import { RefreshToken } from '../db/models/refreshToken'
import { RegistrationToken } from '../db/models/registrationToken'
import { PLANS, ROLES } from '../constants'
import { toSlug } from '../utils/slug'

const SAMPLE_USERS = [
  {
    name: 'Prasanth Kumar',
    email: 'prashanthkumarmorcha@gmail.com',
    avatar: null,
  },
  {
    name: 'Alice Walker',
    email: 'alice@example.com',
    avatar: 'https://i.pravatar.cc/150?u=alice@example.com',
  },
  {
    name: 'Bob Chen',
    email: 'bob@example.com',
    avatar: 'https://i.pravatar.cc/150?u=bob@example.com',
  },
  {
    name: 'Carol Singh',
    email: 'carol@example.com',
    avatar: 'https://i.pravatar.cc/150?u=carol@example.com',
  },
  {
    name: 'Diego Ramos',
    email: 'diego@example.com',
    avatar: 'https://i.pravatar.cc/150?u=diego@example.com',
  },
]

interface SeedSpec {
  workspaceName: string
  ownerEmail: string
  members: Array<{ email: string; role: 'admin' | 'manager' }>
}

const SAMPLE_WORKSPACES: SeedSpec[] = [
  {
    workspaceName: 'Acme Corp',
    ownerEmail: 'prashanthkumarmorcha@gmail.com',
    members: [
      { email: 'alice@example.com', role: 'admin' },
      { email: 'bob@example.com', role: 'manager' },
      { email: 'diego@example.com', role: 'manager' },
    ],
  },
  {
    workspaceName: 'Studio Loop',
    ownerEmail: 'alice@example.com',
    members: [
      { email: 'carol@example.com', role: 'admin' },
      { email: 'prashanthkumarmorcha@gmail.com', role: 'manager' },
    ],
  },
  {
    workspaceName: 'Solo Sandbox',
    ownerEmail: 'carol@example.com',
    members: [],
  },
]

export interface SeedResult {
  users: Array<{ _id: string; name: string; email: string }>
  workspaces: Array<{
    _id: string
    name: string
    slug: string
    members: Array<{ email: string; role: string }>
  }>
}

export async function seedDatabase({ reset = false }: { reset?: boolean } = {}): Promise<SeedResult> {
  await connectMongo()

  if (reset) {
    await Promise.all([
      User.deleteMany({}),
      Workspace.deleteMany({}),
      WorkspaceMember.deleteMany({}),
      Otp.deleteMany({}),
      OtpRateLimit.deleteMany({}),
      RefreshToken.deleteMany({}),
      RegistrationToken.deleteMany({}),
    ])
  }

  // ── Users ───────────────────────────────────────────────────────────
  const userDocs = await Promise.all(
    SAMPLE_USERS.map(async (u) => {
      const existing = await User.findOne({ email: u.email })
      if (existing) return existing
      return User.create({
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        isVerified: true,
        status: 'active',
        lastLoginAt: new Date(),
      })
    }),
  )

  const usersByEmail = new Map(userDocs.map((u) => [u.email, u]))

  // ── Workspaces + memberships ────────────────────────────────────────
  const workspaceResults: SeedResult['workspaces'] = []
  const { limits } = PLANS.free

  for (const spec of SAMPLE_WORKSPACES) {
    const owner = usersByEmail.get(spec.ownerEmail)
    if (!owner) continue

    const slug = toSlug(spec.workspaceName)
    let ws = await Workspace.findOne({ slug })
    if (!ws) {
      ws = await Workspace.create({
        name: spec.workspaceName,
        slug,
        ownerId: owner._id,
        plan: 'free',
        maxTemplates: limits.maxTemplates,
        maxMembers: limits.maxMembers,
        maxExportsMo: limits.maxExportsMo,
      })
    }

    // Owner membership
    await WorkspaceMember.updateOne(
      { workspaceId: ws._id, userId: owner._id },
      {
        $set: {
          workspaceId: ws._id,
          userId: owner._id,
          role: ROLES.OWNER,
          status: 'active',
          joinedAt: new Date(),
        },
        $unset: { inviteToken: '' },
      },
      { upsert: true },
    )

    // Other members
    const memberRows: Array<{ email: string; role: string }> = [
      { email: owner.email, role: ROLES.OWNER },
    ]
    for (const m of spec.members) {
      const u = usersByEmail.get(m.email)
      if (!u) continue
      await WorkspaceMember.updateOne(
        { workspaceId: ws._id, userId: u._id },
        {
          $set: {
            workspaceId: ws._id,
            userId: u._id,
            role: m.role,
            status: 'active',
            joinedAt: new Date(),
          },
          $unset: { inviteToken: '' },
        },
        { upsert: true },
      )
      memberRows.push({ email: u.email, role: m.role })
    }

    workspaceResults.push({
      _id: ws._id.toString(),
      name: ws.name,
      slug: ws.slug,
      members: memberRows,
    })
  }

  return {
    users: userDocs.map((u) => ({ _id: u._id.toString(), name: u.name, email: u.email })),
    workspaces: workspaceResults,
  }
}
