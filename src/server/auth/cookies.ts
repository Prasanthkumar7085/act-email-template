import { durationToSeconds } from './jwt'
import { env, isProd } from '../env'

export const ACCESS_COOKIE = 'mailix_at'
export const REFRESH_COOKIE = 'mailix_rt'
export const WORKSPACE_COOKIE = 'mailix_ws'

interface CookieOptions {
  maxAge?: number
  httpOnly?: boolean
  path?: string
  sameSite?: 'Lax' | 'Strict' | 'None'
}

function serializeCookie(name: string, value: string, opts: CookieOptions = {}): string {
  const parts = [`${name}=${value}`, `Path=${opts.path ?? '/'}`]
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`)
  parts.push(`SameSite=${opts.sameSite ?? 'Lax'}`)
  if (opts.httpOnly !== false) parts.push('HttpOnly')
  if (isProd()) parts.push('Secure')
  return parts.join('; ')
}

export function buildAuthCookieHeaders(accessToken: string, refreshToken: string): string[] {
  return [
    serializeCookie(ACCESS_COOKIE, accessToken, {
      maxAge: durationToSeconds(env().JWT_ACCESS_EXPIRY),
    }),
    serializeCookie(REFRESH_COOKIE, refreshToken, {
      maxAge: durationToSeconds(env().JWT_REFRESH_EXPIRY),
    }),
  ]
}

export function buildClearAuthCookieHeaders(): string[] {
  return [
    serializeCookie(ACCESS_COOKIE, '', { maxAge: 0 }),
    serializeCookie(REFRESH_COOKIE, '', { maxAge: 0 }),
    serializeCookie(WORKSPACE_COOKIE, '', { maxAge: 0, httpOnly: false }),
  ]
}

export function buildWorkspaceCookieHeader(workspaceId: string): string {
  return serializeCookie(WORKSPACE_COOKIE, workspaceId, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30,
  })
}

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  const out: Record<string, string> = {}
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (k) out[k] = decodeURIComponent(v)
  }
  return out
}

export function readAuthCookies(request: Request) {
  const cookies = parseCookies(request.headers.get('cookie'))
  return {
    accessToken: cookies[ACCESS_COOKIE] ?? null,
    refreshToken: cookies[REFRESH_COOKIE] ?? null,
    workspaceId: cookies[WORKSPACE_COOKIE] ?? null,
  }
}

/**
 * Attach an array of cookies to an existing Response.
 * (Headers#append on `Set-Cookie` lets multiple cookies coexist.)
 */
export function attachCookies(res: Response, cookies: string[]): Response {
  const headers = new Headers(res.headers)
  for (const c of cookies) headers.append('Set-Cookie', c)
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
}
