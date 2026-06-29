export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_HIERARCHY: Record<Role, number> = {
  manager: 10,
  admin: 20,
  owner: 30,
}

export const PLANS = {
  free: {
    name: 'Free',
    price: { monthly: 0, yearly: 0, currency: 'INR' },
    limits: { maxTemplates: 10, maxMembers: 2, maxExportsMo: 50 },
  },
  pro: {
    name: 'Pro',
    price: { monthly: 99900, yearly: 999900, currency: 'INR' },
    limits: { maxTemplates: 100, maxMembers: 5, maxExportsMo: 500 },
  },
  business: {
    name: 'Business',
    price: { monthly: 299900, yearly: 2999900, currency: 'INR' },
    limits: { maxTemplates: -1, maxMembers: 15, maxExportsMo: -1 },
  },
} as const

export const ERR = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_INVALID: 'OTP_INVALID',
  OTP_MAX_ATTEMPTS: 'OTP_MAX_ATTEMPTS',
  OTP_RATE_LIMITED: 'OTP_RATE_LIMITED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_ROLE: 'INSUFFICIENT_ROLE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  WORKSPACE_NOT_FOUND: 'WORKSPACE_NOT_FOUND',
  MEMBER_NOT_FOUND: 'MEMBER_NOT_FOUND',
  INVITE_NOT_FOUND: 'INVITE_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  MEMBER_ALREADY_EXISTS: 'MEMBER_ALREADY_EXISTS',
  INVITE_ALREADY_ACCEPTED: 'INVITE_ALREADY_ACCEPTED',
  WORKSPACE_SUSPENDED: 'WORKSPACE_SUSPENDED',
  CANNOT_REMOVE_OWNER: 'CANNOT_REMOVE_OWNER',
  CANNOT_CHANGE_OWN_ROLE: 'CANNOT_CHANGE_OWN_ROLE',
  CANNOT_CHANGE_OWNER_ROLE: 'CANNOT_CHANGE_OWNER_ROLE',
  OWNER_TRANSFER_FAILED: 'OWNER_TRANSFER_FAILED',
  PLAN_LIMIT: 'PLAN_LIMIT',
  RATE_LIMITED: 'RATE_LIMITED',
  TOKEN_MISSING: 'TOKEN_MISSING',
  INVALID_WORKSPACE_ID: 'INVALID_WORKSPACE_ID',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const

export const MSG = {
  AUTH: {
    OTP_SENT: 'OTP sent successfully to your email',
    OTP_VERIFIED: 'OTP verified successfully',
    REGISTERED: 'Account registered successfully',
    TOKENS_REFRESHED: 'Tokens refreshed successfully',
    LOGGED_OUT: 'Logged out successfully',
    PROFILE_FETCHED: 'Profile retrieved successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
  },
  WORKSPACE: {
    CREATED: 'Workspace created successfully',
    LIST_FETCHED: 'Workspaces retrieved successfully',
    FETCHED: 'Workspace details retrieved successfully',
    UPDATED: 'Workspace updated successfully',
    DELETED: 'Workspace deleted successfully',
    MEMBERS_FETCHED: 'Members retrieved successfully',
    MEMBER_INVITED: 'Member invited successfully',
    INVITE_ACCEPTED: 'Invite accepted successfully',
    MEMBER_REMOVED: 'Member removed successfully',
    ROLE_CHANGED: 'Member role updated successfully',
    OWNERSHIP_TRANSFERRED: 'Ownership transferred successfully',
  },
  TEMPLATE: {
    CREATED: 'Template saved successfully',
    LIST_FETCHED: 'Templates retrieved successfully',
    FETCHED: 'Template retrieved successfully',
    UPDATED: 'Template updated successfully',
    DELETED: 'Template deleted successfully',
    EXPORTED: 'Template exported successfully',
    PREVIEWED: 'Template preview generated',
    DUPLICATED: 'Template duplicated successfully',
    COPIED_FROM_GALLERY: 'Template copied from gallery',
    GALLERY_FETCHED: 'Gallery retrieved successfully',
  },
} as const
