import SignIn from '@/components/auth/SignIn'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/store/authContext'

function Index() {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: '/templates', replace: true })
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading || isAuthenticated) return null
  return <SignIn />
}

export const Route = createFileRoute('/')({
  component: Index,
})
