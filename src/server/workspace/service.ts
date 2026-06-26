import { nanoid } from 'nanoid'
import mongoose from 'mongoose'
import { connectMongo } from '../db/mongo'
import { Workspace, type IWorkspaceDocument } from '../db/models/workspace'
import { WorkspaceMember } from '../db/models/member'
import { User } from '../db/models/user'
import { AppError } from '../errors'
import { PLANS, ROLES, type Role } from '../constants'
import { uniqueSlug } from '../utils/slug'
import { env } from '../env'
import { sendMail } from '../mail/send'

function sanitizeWorkspace(w: any) {
  return {
    _id: w._id.toString(),
    name: w.name,
    slug: w.slug,
    logo: w.logo ?? null,
    ownerId: w.ownerId?.toString?.() ?? null,
    brandColor: w.brandColor ?? null,
    brandFont: w.brandFont ?? null,
    plan: w.plan,
    maxTemplates: w.maxTemplates,
    maxMembers: w.maxMembers,
    maxExportsMo: w.maxExportsMo,
    exportsUsed: w.exportsUsed ?? 0,
    status: w.status,
    createdAt: w.createdAt,
    updatedAt: w.updatedAt,
  }
}

function sanitizeMember(m: any) {
  return {
    _id: m._id.toString(),
    workspaceId: m.workspaceId.toString(),
    userId: m.userId.toString(),
    role: m.role,
    status: m.status,
    joinedAt: m.joinedAt ?? null,
    createdAt: m.createdAt,
    user:
      m.userId && typeof m.userId === 'object' && 'email' in m.userId
        ? {
            _id: m.userId._id.toString(),
            name: m.userId.name,
            email: m.userId.email,
            avatar: m.userId.avatar ?? null,
          }
        : undefined,
  }
}

// ── createWorkspace ─────────────────────────────────────────────────

export async function createWorkspace(userId: string, name: string): Promise<IWorkspaceDocument> {
  await connectMongo()

  const slug = await uniqueSlug(name, async (s) => !!(await Workspace.findOne({ slug: s })))

  const { limits } = PLANS.free
  const workspace = await Workspace.create({
    name,
    slug,
    ownerId: userId,
    plan: 'free',
    maxTemplates: limits.maxTemplates,
    maxMembers: limits.maxMembers,
    maxExportsMo: limits.maxExportsMo,
  })

  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId,
    role: ROLES.OWNER,
    status: 'active',
    joinedAt: new Date(),
  })

  return workspace
}

// ── listMyWorkspaces ────────────────────────────────────────────────

export async function listMyWorkspaces(userId: string) {
  await connectMongo()

  const memberships = await WorkspaceMember.find({ userId, status: 'active' }).lean()
  if (memberships.length === 0) return []

  const workspaceIds = memberships.map((m) => m.workspaceId)
  const workspaces = await Workspace.find({
    _id: { $in: workspaceIds },
    deletedAt: null,
    status: { $ne: 'suspended' },
  }).lean()

  const wsMap = new Map(workspaces.map((w) => [w._id.toString(), w]))

  return memberships
    .filter((m) => wsMap.has(m.workspaceId.toString()))
    .map((m) => ({
      workspace: sanitizeWorkspace(wsMap.get(m.workspaceId.toString())!),
      role: m.role,
    }))
}

// ── getWorkspace ────────────────────────────────────────────────────

export async function getWorkspace(workspaceId: string) {
  await connectMongo()
  const ws = await Workspace.findOne({ _id: workspaceId, deletedAt: null }).lean()
  if (!ws) throw AppError.notFound('Workspace')
  return sanitizeWorkspace(ws)
}

// ── updateWorkspace ─────────────────────────────────────────────────

export async function updateWorkspace(
  workspaceId: string,
  data: {
    name?: string
    logo?: string | null
    brandColor?: string | null
    brandFont?: string | null
  },
) {
  await connectMongo()
  const update: Record<string, unknown> = {}
  if (data.name !== undefined) {
    update.name = data.name
    update.slug = await uniqueSlug(data.name, async (s) =>
      !!(await Workspace.findOne({ slug: s, _id: { $ne: workspaceId } })),
    )
  }
  if (data.logo !== undefined) update.logo = data.logo
  if (data.brandColor !== undefined) update.brandColor = data.brandColor
  if (data.brandFont !== undefined) update.brandFont = data.brandFont

  const ws = await Workspace.findByIdAndUpdate(
    workspaceId,
    { $set: update },
    { new: true, runValidators: true },
  ).lean()
  if (!ws) throw AppError.notFound('Workspace')
  return sanitizeWorkspace(ws)
}

// ── deleteWorkspace ─────────────────────────────────────────────────

export async function deleteWorkspace(workspaceId: string) {
  await connectMongo()
  const ws = await Workspace.findByIdAndUpdate(
    workspaceId,
    { $set: { deletedAt: new Date() } },
    { new: true },
  ).lean()
  if (!ws) throw AppError.notFound('Workspace')
  return { message: 'Workspace deleted' }
}

// ── listMembers ─────────────────────────────────────────────────────

export async function listMembers(workspaceId: string) {
  await connectMongo()
  const members = await WorkspaceMember.find({ workspaceId })
    .populate('userId', 'name email avatar')
    .lean()
  return members.map(sanitizeMember)
}

// ── inviteMember ────────────────────────────────────────────────────

export async function inviteMember(
  workspaceId: string,
  email: string,
  role: 'admin' | 'manager',
) {
  await connectMongo()

  const workspace = await Workspace.findById(workspaceId).lean()
  if (!workspace) throw AppError.notFound('Workspace')

  const activeCount = await WorkspaceMember.countDocuments({ workspaceId, status: 'active' })
  if (workspace.maxMembers !== -1 && activeCount >= workspace.maxMembers) {
    throw AppError.planLimit('members', workspace.maxMembers)
  }

  const user = await User.findOne({ email }).lean()

  if (user) {
    const existing = await WorkspaceMember.findOne({ workspaceId, userId: user._id })
    if (existing) {
      if (existing.status === 'active') {
        throw AppError.conflict('MEMBER_ALREADY_EXISTS', 'This user is already a member of the workspace')
      }
      existing.inviteToken = nanoid(32)
      existing.role = role
      await existing.save()
      void queueInviteEmail(email, existing.inviteToken!, workspace.name, role)
      return sanitizeMember(existing.toObject())
    }
  }

  const inviteToken = nanoid(32)
  const member = await WorkspaceMember.create({
    workspaceId,
    userId: user?._id ?? new mongoose.Types.ObjectId(),
    role,
    status: 'invited',
    inviteToken,
  })

  void queueInviteEmail(email, inviteToken, workspace.name, role)
  return sanitizeMember(member.toObject())
}

async function queueInviteEmail(email: string, token: string, workspaceName: string, role: string) {
  try {
    await sendMail({
      to: email,
      subject: `You've been invited to ${workspaceName}`,
      html: `
        <p>You've been invited to join <strong>${workspaceName}</strong> as <strong>${role}</strong>.</p>
        <p><a href="${env().APP_URL}/invite/${token}">Accept your invite</a></p>
      `,
    })
  } catch (err) {
    console.error('[mail] invite send failed', err)
  }
}

// ── acceptInvite ────────────────────────────────────────────────────

export async function acceptInvite(inviteToken: string, userId: string) {
  await connectMongo()
  const member = await WorkspaceMember.findOne({ inviteToken })
  if (!member) throw AppError.notFound('Invite')
  if (member.status !== 'invited') {
    throw AppError.badRequest('INVITE_ALREADY_ACCEPTED', 'This invite has already been accepted')
  }

  member.userId = new mongoose.Types.ObjectId(userId)
  member.status = 'active'
  member.joinedAt = new Date()
  member.inviteToken = null
  await member.save()

  return sanitizeMember(member.toObject())
}

// ── removeMember ────────────────────────────────────────────────────

export async function removeMember(
  workspaceId: string,
  targetUserId: string,
  actorRole: Role,
) {
  await connectMongo()
  const target = await WorkspaceMember.findOne({ workspaceId, userId: targetUserId })
  if (!target) throw AppError.notFound('Member')

  if (target.role === ROLES.OWNER) {
    throw AppError.badRequest('CANNOT_REMOVE_OWNER', 'The workspace owner cannot be removed')
  }
  if (actorRole === ROLES.ADMIN && target.role === ROLES.ADMIN) {
    throw AppError.forbidden('Admins cannot remove other admins. Only the owner can.')
  }

  await target.deleteOne()
  return { message: 'Member removed' }
}

// ── changeRole ──────────────────────────────────────────────────────

export async function changeRole(
  workspaceId: string,
  targetUserId: string,
  newRole: 'admin' | 'manager',
  currentUserId: string,
) {
  await connectMongo()
  if (targetUserId === currentUserId) {
    throw AppError.badRequest('CANNOT_CHANGE_OWN_ROLE', 'You cannot change your own role')
  }

  const target = await WorkspaceMember.findOne({ workspaceId, userId: targetUserId })
  if (!target) throw AppError.notFound('Member')
  if (target.role === ROLES.OWNER) {
    throw AppError.badRequest(
      'CANNOT_CHANGE_OWNER_ROLE',
      'Cannot change the owner role. Use transfer ownership instead.',
    )
  }

  target.role = newRole
  await target.save()
  return sanitizeMember(target.toObject())
}

// ── transferOwnership ───────────────────────────────────────────────

export async function transferOwnership(
  workspaceId: string,
  newOwnerId: string,
  currentOwnerId: string,
) {
  await connectMongo()
  const newOwnerMember = await WorkspaceMember.findOne({
    workspaceId,
    userId: newOwnerId,
    status: 'active',
  })
  if (!newOwnerMember) throw AppError.notFound('Member')
  if (newOwnerMember.role !== ROLES.ADMIN) {
    throw AppError.badRequest('OWNER_TRANSFER_FAILED', 'Ownership can only be transferred to an admin')
  }

  const currentOwnerMember = await WorkspaceMember.findOne({
    workspaceId,
    userId: currentOwnerId,
  })
  if (!currentOwnerMember) throw AppError.notFound('Member')

  newOwnerMember.role = ROLES.OWNER
  currentOwnerMember.role = ROLES.ADMIN

  await Promise.all([
    newOwnerMember.save(),
    currentOwnerMember.save(),
    Workspace.findByIdAndUpdate(workspaceId, { ownerId: newOwnerId }),
  ])

  return { message: 'Ownership transferred' }
}
