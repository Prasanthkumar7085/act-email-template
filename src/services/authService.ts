import { api } from './api'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SendOtpResponse {
  success: boolean
  data: { message: string }
}

export interface VerifyOtpResponse {
  success: boolean
  data: {
    isNewUser: boolean
    registrationToken?: string
    accessToken?: string
    refreshToken?: string
  }
}

export interface RegisterResponse {
  success: boolean
  data: {
    user: { _id: string; name: string; email: string }
    workspace: { _id: string; name: string; slug: string }
    accessToken: string
    refreshToken: string
  }
}

export interface RefreshResponse {
  success: boolean
  data: { accessToken: string; refreshToken: string }
}

export interface MeResponse {
  success: boolean
  data: {
    _id: string
    name: string
    email: string
    phone?: string
    avatar?: string
    status: string
    createdAt: string
  }
}

// ── Auth service ──────────────────────────────────────────────────────────────

/**
 * Step 1: Send OTP to email.
 */
export function sendOtp(email: string): Promise<SendOtpResponse> {
  return api.post<SendOtpResponse>('/api/v1/auth/otp/send', { email }, false)
}

/**
 * Step 2: Verify OTP.
 * Returns { isNewUser: true, registrationToken } for new users.
 * Returns { isNewUser: false, accessToken, refreshToken } for existing users.
 */
export function verifyOtp(email: string, code: string): Promise<VerifyOtpResponse> {
  return api.post<VerifyOtpResponse>('/api/v1/auth/otp/verify', { email, code }, false)
}

/**
 * Step 3 (new users only): Complete registration.
 */
export function register(
  name: string,
  email: string,
  workspaceName: string,
): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/api/v1/auth/register', { name, email, workspaceName }, false)
}

/**
 * Refresh access token using refresh token.
 */
export function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  return api.post<RefreshResponse>('/api/v1/auth/refresh', { refreshToken }, false)
}

/**
 * Logout — invalidates the refresh token on the server.
 */
export function logout(refreshToken: string): Promise<void> {
  return api.post<void>('/api/v1/auth/logout', { refreshToken })
}

/**
 * Get the current authenticated user's profile.
 */
export function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>('/api/v1/auth/me')
}
