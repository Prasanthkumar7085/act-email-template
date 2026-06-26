/**
 * Same-origin API client. Tokens live in httpOnly cookies set by the server —
 * we never touch them here. Workspace selection (non-sensitive) is stored in a
 * readable cookie so server routes can fall back to it.
 */

const isBrowser = typeof window !== 'undefined'

const WORKSPACE_COOKIE = 'mailix_ws'

function readCookie(name: string): string | null {
  if (!isBrowser) return null
  const prefix = `${name}=`
  for (const part of document.cookie.split('; ')) {
    if (part.startsWith(prefix)) return decodeURIComponent(part.slice(prefix.length))
  }
  return null
}

function writeCookie(name: string, value: string, maxAgeSec = 60 * 60 * 24 * 30) {
  if (!isBrowser) return
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax`
}

function deleteCookie(name: string) {
  if (!isBrowser) return
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function getWorkspaceId(): string | null {
  return readCookie(WORKSPACE_COOKIE)
}

export function setWorkspaceId(id: string): void {
  writeCookie(WORKSPACE_COOKIE, id)
}

export function clearWorkspaceId(): void {
  deleteCookie(WORKSPACE_COOKIE)
}

// ── Core request ──────────────────────────────────────────────────────────────

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'same-origin',
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let json: any
  try {
    json = await res.json()
  } catch {
    json = null
  }

  if (!res.ok) {
    const message = json?.error?.message ?? json?.message ?? `Request failed with status ${res.status}`
    throw new Error(message)
  }

  return json as T
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
