import { createFileRoute } from '@tanstack/react-router'
import WorkspaceSettingsPage from '@/components/settings/WorkspaceSettingsPage'

export const Route = createFileRoute('/_auth/settings/workspace')({
  component: WorkspaceSettingsPage,
})
