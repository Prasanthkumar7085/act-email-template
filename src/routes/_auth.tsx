import { Outlet, createFileRoute } from '@tanstack/react-router'
import { useAuth } from '@/store/authContext'

function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading || !isAuthenticated) return null
  return <Outlet />
}

export const Route = createFileRoute('/_auth')({
  component: AuthGuard,
})
