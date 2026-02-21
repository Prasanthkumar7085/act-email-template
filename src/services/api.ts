/**
 * Base API client for Mailix backend.
 * Reads VITE_API_URL from env (fallback: http://localhost:3000).
 */

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'

// Guard for SSR — localStorage only exists in the browser
const isBrowser = typeof window !== 'undefined'

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  return isBrowser ? localStorage.getItem('mailix_access_token') : null
}

export function getRefreshToken(): string | null {
  return isBrowser ? localStorage.getItem('mailix_refresh_token') : null
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (!isBrowser) return
  localStorage.setItem('mailix_access_token', accessToken)
  localStorage.setItem('mailix_refresh_token', refreshToken)
}

export function clearAuth(): void {
  if (!isBrowser) return
  localStorage.removeItem('mailix_access_token')
  localStorage.removeItem('mailix_refresh_token')
  localStorage.removeItem('mailix_workspace_id')
  localStorage.removeItem('mailix_user')
}

export function getWorkspaceId(): string | null {
  return isBrowser ? localStorage.getItem('mailix_workspace_id') : null
}

export function setWorkspaceId(id: string): void {
  if (!isBrowser) return
  localStorage.setItem('mailix_workspace_id', id)
}

export function setUser(user: Record<string, unknown>): void {
  if (!isBrowser) return
  localStorage.setItem('mailix_user', JSON.stringify(user))
}

export function getUser(): Record<string, unknown> | null {
  if (!isBrowser) return null
  try {
    const raw = localStorage.getItem('mailix_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ── Core request ──────────────────────────────────────────────────────────────

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (auth) {
    const token = getAccessToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = await res.json()

  if (!res.ok) {
    const message =
      json?.error?.message ||
      json?.message ||
      `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return json as T
}

// ── Typed shortcuts ───────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, auth = true) =>
    request<T>('GET', path, undefined, auth),

  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>('POST', path, body, auth),

  patch: <T>(path: string, body?: unknown, auth = true) =>
    request<T>('PATCH', path, body, auth),

  delete: <T>(path: string, auth = true) =>
    request<T>('DELETE', path, undefined, auth),
}
