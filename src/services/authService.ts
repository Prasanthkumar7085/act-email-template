import { api } from './api'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface SendOtpResponse {
  success: boolean
  data: { message: string }
}

export interface VerifyOtpResponse {
  success: boolean
  data: { user: AuthUser }
}

export interface RegisterResponse {
  success: boolean
  data: {
    user: AuthUser
    workspace: { _id: string; name: string; slug: string }
  }
}

export interface MeResponse {
  success: boolean
  data: AuthUser
}

// ── Auth service ──────────────────────────────────────────────────────────────

export function sendOtp(email: string): Promise<SendOtpResponse> {
  return api.post<SendOtpResponse>('/api/auth/otp/send', { email })
}

export function verifyOtp(email: string, code: string): Promise<VerifyOtpResponse> {
  return api.post<VerifyOtpResponse>('/api/auth/otp/verify', { email, code })
}

export function register(
  name: string,
  email: string,
  workspaceName: string,
): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/api/auth/register', { name, email, workspaceName })
}

export function logout(): Promise<void> {
  return api.post<void>('/api/auth/logout')
}

export function getMe(): Promise<MeResponse> {
  return api.get<MeResponse>('/api/auth/me')
}
