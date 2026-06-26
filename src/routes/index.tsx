import SignIn from '@/components/auth/SignIn'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { loadCurrentUser } from '@/server/auth/currentUser'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = await loadCurrentUser()
    if (user) {
      throw redirect({ to: '/templates' })
    }
  },
  component: SignIn,
})
