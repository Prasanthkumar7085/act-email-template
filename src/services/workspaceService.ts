import { api } from './api'

export interface Workspace {
  _id: string
  name: string
  slug: string
  logo?: string | null
  brandColor?: string | null
  brandFont?: string | null
  plan: string
  maxTemplates: number
  maxMembers: number
  maxExportsMo: number
  exportsUsed: number
  status: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface WorkspaceListResponse {
  success: boolean
  data: Workspace[]
}

// Backend returns { workspace: {...}, role: string }[] — flatten before returning
interface RawWorkspaceItem {
  workspace: Omit<Workspace, 'role'>
  role: string
}

/**
 * List all workspaces the current user belongs to.
 * Backend returns { workspace: {...}, role: string }[] so we flatten it.
 */
export async function listMyWorkspaces(): Promise<WorkspaceListResponse> {
  const res = await api.get<{ success: boolean; data: RawWorkspaceItem[] }>('/api/v1/workspaces')
  return {
    success: res.success,
    data: res.data.map((item) => ({
      ...item.workspace,
      role: item.role,
    })),
  }
}
