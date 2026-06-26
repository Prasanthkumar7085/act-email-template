import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { loadCurrentUser } from '@/server/auth/currentUser'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const user = await loadCurrentUser()
    if (!user) {
      throw redirect({ to: '/' })
    }
    return { user }
  },
  component: () => <Outlet />,
})
