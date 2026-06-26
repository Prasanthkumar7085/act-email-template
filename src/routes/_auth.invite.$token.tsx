import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'
import { Check, AlertTriangle, Loader2 } from 'lucide-react'
import { acceptInvite } from '@/services/workspaceService'
import { useAuth } from '@/store/authContext'

export const Route = createFileRoute('/_auth/invite/$token')({
  component: AcceptInvitePage,
})

function AcceptInvitePage() {
  const { token } = useParams({ from: '/_auth/invite/$token' })
  const navigate = useNavigate()
  const { bootstrap } = useAuth()
  const [state, setState] = useState<'pending' | 'done' | 'error'>('pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await acceptInvite(token)
        await bootstrap()
        if (cancelled) return
        setState('done')
        setTimeout(() => navigate({ to: '/templates' }), 800)
      } catch (e: any) {
        if (cancelled) return
        setError(e?.message ?? 'Failed to accept invite')
        setState('error')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, bootstrap, navigate])

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-surface-200 px-8 py-10 max-w-md w-full text-center">
        {state === 'pending' && (
          <>
            <Loader2 className="w-8 h-8 mx-auto text-brand-600 animate-spin" />
            <h1 className="mt-4 text-lg font-semibold text-surface-900">Accepting your invite…</h1>
          </>
        )}
        {state === 'done' && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-surface-900">You're in!</h1>
            <p className="mt-1 text-sm text-surface-500">Taking you to your templates…</p>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-surface-900">Invite couldn't be accepted</h1>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
            <button
              onClick={() => navigate({ to: '/templates' })}
              className="mt-5 inline-flex items-center px-4 py-2 rounded-lg bg-surface-900 text-white text-sm font-medium hover:bg-surface-800 cursor-pointer"
            >
              Go to templates
            </button>
          </>
        )}
      </div>
    </main>
  )
}
