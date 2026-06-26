import mongoose from 'mongoose'
import { AppError } from '../errors'
import { ROLE_HIERARCHY, type Role } from '../constants'
import { User, type IUserDocument } from '../db/models/user'
import { Workspace, type IWorkspaceDocument } from '../db/models/workspace'
import { WorkspaceMember, type IMemberDocument } from '../db/models/member'
import { verifyAccessToken } from './jwt'
import { readAuthCookies } from './cookies'

export interface AuthContext {
  userId: string
  user: IUserDocument
}

export interface WorkspaceContext extends AuthContext {
  workspace: IWorkspaceDocument
  membership: IMemberDocument
  role: Role
}

/**
 * Resolve the current user from the access-token cookie.
 * Throws AppError.unauthorized if absent / invalid / suspended.
 */
export async function requireUser(request: Request): Promise<AuthContext> {
  const { accessToken } = readAuthCookies(request)
  if (!accessToken) throw AppError.unauthorized('Not signed in')

  const { userId } = verifyAccessToken(accessToken)
  const user = await User.findById(userId)
  if (!user) throw AppError.unauthorized('User not found')
  if (user.status !== 'active') {
    throw AppError.badRequest('ACCOUNT_SUSPENDED', 'Your account has been suspended')
  }

  return { userId: user._id.toString(), user }
}

/**
 * Resolve current user + workspace membership.
 * `minRole` (optional) enforces RBAC at the same time.
 */
export async function requireMember(
  request: Request,
  wsId: string,
  minRole?: Role,
): Promise<WorkspaceContext> {
  const auth = await requireUser(request)

  if (!wsId || !mongoose.Types.ObjectId.isValid(wsId)) {
    throw AppError.badRequest('INVALID_WORKSPACE_ID', 'Invalid workspace ID format')
  }

  const workspace = await Workspace.findOne({ _id: wsId, deletedAt: null })
  if (!workspace) throw AppError.notFound('Workspace')
  if (workspace.status === 'suspended') {
    throw AppError.badRequest('WORKSPACE_SUSPENDED', 'This workspace has been suspended')
  }

  const membership = await WorkspaceMember.findOne({
    workspaceId: wsId,
    userId: auth.userId,
    status: 'active',
  })
  if (!membership) throw AppError.forbidden('You are not a member of this workspace')

  if (minRole) {
    const userLevel = ROLE_HIERARCHY[membership.role] ?? 0
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0
    if (userLevel < requiredLevel) throw AppError.insufficientRole(minRole)
  }

  return {
    ...auth,
    workspace,
    membership,
    role: membership.role,
  }
}
