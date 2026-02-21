import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getAccessToken,
  getUser,
  clearAuth,
  setTokens,
  setUser as saveUser,
  setWorkspaceId,
  getWorkspaceId,
} from '../services/api'
import { getMe } from '../services/authService'
import { listMyWorkspaces, type Workspace } from '../services/workspaceService'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  status: string
}

interface AuthState {
  user: AuthUser | null
  workspace: Workspace | null
  workspaceId: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (accessToken: string, refreshToken: string) => Promise<void>
  logout: () => void
  switchWorkspace: (workspace: Workspace) => void
  workspaces: Workspace[]
  refreshUser: () => Promise<void>
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getUser() as AuthUser | null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ── Boot: restore session on mount ────────────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      const token = getAccessToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        // Re-fetch user profile to validate token
        const meRes = await getMe()
        const freshUser = meRes.data as AuthUser
        setUser(freshUser)
        saveUser(freshUser as unknown as Record<string, unknown>)

        // Load workspaces
        const wsRes = await listMyWorkspaces()
        const wsList = wsRes.data
        setWorkspaces(wsList)

        // Pick active workspace
        const savedWsId = getWorkspaceId()
        const active = wsList.find((w) => w._id === savedWsId) ?? wsList[0] ?? null
        if (active) {
          setWorkspace(active)
          setWorkspaceId(active._id)
        }
      } catch {
        // Token invalid — clear auth
        clearAuth()
        setUser(null)
        setWorkspace(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken)

    const meRes = await getMe()
    const freshUser = meRes.data as AuthUser
    setUser(freshUser)
    saveUser(freshUser as unknown as Record<string, unknown>)

    const wsRes = await listMyWorkspaces()
    const wsList = wsRes.data
    setWorkspaces(wsList)

    const active = wsList[0] ?? null
    if (active) {
      setWorkspace(active)
      setWorkspaceId(active._id)
    }
  }, [])

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuth()
    setUser(null)
    setWorkspace(null)
    setWorkspaces([])
  }, [])

  // ── switchWorkspace ───────────────────────────────────────────────────────
  const switchWorkspace = useCallback((ws: Workspace) => {
    setWorkspace(ws)
    setWorkspaceId(ws._id)
  }, [])

  // ── refreshUser ───────────────────────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const meRes = await getMe()
      const freshUser = meRes.data as AuthUser
      setUser(freshUser)
      saveUser(freshUser as unknown as Record<string, unknown>)
    } catch {
      // ignore
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        workspaceId: workspace?._id ?? null,
        isAuthenticated: !!user && !!getAccessToken(),
        isLoading,
        login,
        logout,
        switchWorkspace,
        workspaces,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
