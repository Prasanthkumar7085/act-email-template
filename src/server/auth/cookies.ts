import {
  setCookie as startSetCookie,
  deleteCookie as startDeleteCookie,
} from '@tanstack/react-start/server'
import { SESSION_TTL_SECONDS } from './jwt'
import { isProd } from '../env'

export const SESSION_COOKIE = 'mailix_session'
export const WORKSPACE_COOKIE = 'mailix_ws'

function authCookieOpts() {
  return {
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isProd(),
  }
}

export function setSessionCookie(token: string): void {
  startSetCookie(SESSION_COOKIE, token, authCookieOpts())
}

export function clearAuthCookies(): void {
  startDeleteCookie(SESSION_COOKIE, { path: '/' })
  startDeleteCookie(WORKSPACE_COOKIE, { path: '/' })
}

export function setWorkspaceCookie(workspaceId: string): void {
  startSetCookie(WORKSPACE_COOKIE, workspaceId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
    sameSite: 'lax',
    secure: isProd(),
  })
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
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

export function readSessionToken(request: Request): string | null {
  const cookies = parseCookies(request.headers.get('cookie'))
  return cookies[SESSION_COOKIE] ?? null
}

export function readWorkspaceId(request: Request): string | null {
  const cookies = parseCookies(request.headers.get('cookie'))
  return cookies[WORKSPACE_COOKIE] ?? null
}
