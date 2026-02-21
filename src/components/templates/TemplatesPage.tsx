import { useState, useEffect, useCallback } from 'react'
import AppHeader from '../ui/AppHeader'
import TemplateCard from './TemplateCard'
import { useRouter } from '@tanstack/react-router'
import {
  Search, Plus, Sparkles, FolderOpen, Loader2, RefreshCw,
  Globe, LayoutTemplate, Trash2, Copy, MoreVertical, X
} from 'lucide-react'
import {
  listTemplates, listGallery, deleteTemplate, duplicateTemplate,
  copyFromGallery, type Template,
} from '../../services/templateService'
import { listCategories, type Category } from '../../services/categoryService'
import { useAuth } from '../../store/authContext'

type ToastState = { message: string; type: 'success' | 'error' } | null

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => { if (toast) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); } }, [toast, onClose])
  if (!toast) return null
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
      <span>{toast.message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <p className="text-sm text-surface-700 mb-5 leading-relaxed">{message}</p>
        <div className="flex items-center gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors cursor-pointer">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors cursor-pointer">Delete</button>
        </div>
      </div>
    </div>
  )
}

type Tab = 'my' | 'gallery'

export default function TemplatesPage() {
  const router = useRouter()
  const { isAuthenticated, workspaceId } = useAuth()

  const [tab, setTab] = useState<Tab>('my')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [isLoaded, setIsLoaded] = useState(false)

  const [templates, setTemplates] = useState<Template[]>([])
  const [gallery, setGallery] = useState<Template[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [toast, setToast] = useState<ToastState>(null)
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => { const t = setTimeout(() => setIsLoaded(true), 50); return () => clearTimeout(t); }, [])

  useEffect(() => {
    if (!isAuthenticated) router.navigate({ to: '/' })
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!workspaceId) return
    listCategories().then((r) => setCategories(r.data)).catch(() => {})
  }, [workspaceId])

  const loadTemplates = useCallback(async () => {
    if (!workspaceId) return
    setIsLoading(true); setError(null)
    try {
      const filters: Record<string, any> = { page, limit: 20 }
      if (query) filters.search = query
      if (statusFilter !== 'all') filters.status = statusFilter
      if (categoryFilter !== 'All') {
        const cat = categories.find((c) => c.name === categoryFilter)
        if (cat) filters.category = cat._id
      }
      const res = await listTemplates(filters)
      setTemplates(res.data)
      setTotalPages(res.meta?.totalPages ?? 1)
    } catch (err: any) { setError(err.message || 'Failed to load templates') }
    finally { setIsLoading(false) }
  }, [workspaceId, page, query, statusFilter, categoryFilter, categories])

  const loadGallery = useCallback(async () => {
    setIsLoading(true); setError(null)
    try {
      const res = await listGallery(categoryFilter !== 'All' ? categoryFilter : undefined)
      setGallery(res.data)
    } catch (err: any) { setError(err.message || 'Failed to load gallery') }
    finally { setIsLoading(false) }
  }, [categoryFilter])

  useEffect(() => { if (tab === 'my') loadTemplates() }, [tab, loadTemplates])
  useEffect(() => { if (tab === 'gallery') loadGallery() }, [tab, loadGallery])

  useEffect(() => { const t = setTimeout(() => { setPage(1); }, 350); return () => clearTimeout(t); }, [query])

  function openTemplate(tpl: Template) {
    try {
      localStorage.setItem('selectedTemplate', JSON.stringify(tpl.editorData ?? { time: Date.now(), blocks: [], version: '2.30.8' }))
      localStorage.setItem('editingTemplateId', tpl._id)
      localStorage.setItem('editingTemplateName', tpl.name)
    } catch {}
    router.navigate({ to: '/builder' })
  }

  async function handleDuplicate(tpl: Template) {
    setActionLoading(tpl._id); setOpenMenu(null)
    try {
      await duplicateTemplate(tpl._id)
      setToast({ message: `"${tpl.name}" duplicated`, type: 'success' })
      loadTemplates()
    } catch (err: any) { setToast({ message: err.message || 'Failed to duplicate', type: 'error' }) }
    finally { setActionLoading(null) }
  }

  async function handleDelete(tpl: Template) {
    setActionLoading(tpl._id); setDeleteTarget(null); setOpenMenu(null)
    try {
      await deleteTemplate(tpl._id)
      setToast({ message: `"${tpl.name}" deleted`, type: 'success' })
      setTemplates((prev) => prev.filter((t) => t._id !== tpl._id))
    } catch (err: any) { setToast({ message: err.message || 'Failed to delete', type: 'error' }) }
    finally { setActionLoading(null) }
  }

  async function handleCopyFromGallery(tpl: Template) {
    setActionLoading(tpl._id)
    try {
      await copyFromGallery(tpl._id)
      setToast({ message: `"${tpl.name}" added to your workspace`, type: 'success' })
    } catch (err: any) { setToast({ message: err.message || 'Failed to copy template', type: 'error' }) }
    finally { setActionLoading(null) }
  }

  const displayItems = tab === 'gallery'
    ? gallery.filter((t) => !query || t.name.toLowerCase().includes(query.toLowerCase()))
    : templates

  const categoryNames = ['All', ...categories.map((c) => c.name)]

  return (
    <div className="h-full bg-gradient-to-br from-surface-50 via-white to-surface-100/50">
      <AppHeader />
      <main className="w-full px-6 lg:px-10 py-10 lg:py-14 max-w-[95%] mx-auto">

        {/* Header */}
        <div className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Email Templates</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-surface-900 tracking-tight">Your Templates</h1>
              <p className="text-surface-500 text-base max-w-md leading-relaxed">Design, manage, and export your email templates from one place.</p>
            </div>
            <button onClick={() => { localStorage.removeItem('editingTemplateId'); router.navigate({ to: '/builder' }); }}
              className="group flex items-center gap-2.5 px-5 py-3 bg-brand-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 hover:bg-brand-700 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 cursor-pointer self-start lg:self-auto">
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:rotate-90"><Plus className="w-3 h-3" /></div>
              New template
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`transition-all duration-700 delay-75 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-1 p-1 bg-surface-100 rounded-xl w-fit mb-8">
            <button onClick={() => { setTab('my'); setPage(1); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${tab === 'my' ? 'bg-white text-surface-900 shadow-subtle' : 'text-surface-500 hover:text-surface-900'}`}>
              <LayoutTemplate className="w-4 h-4" /> My Templates
            </button>
            <button onClick={() => { setTab('gallery'); setCategoryFilter('All'); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${tab === 'gallery' ? 'bg-white text-surface-900 shadow-subtle' : 'text-surface-500 hover:text-surface-900'}`}>
              <Globe className="w-4 h-4" /> Gallery
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`transition-all duration-700 delay-100 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-brand-500"><Search className="w-4 h-4" /></div>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search templates..." className="w-full pl-11 pr-4 py-3 bg-white border border-surface-200 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 hover:border-surface-300 transition-all duration-300 shadow-sm" />
              {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-200 hover:bg-surface-300 flex items-center justify-center text-surface-500 hover:text-surface-700 transition-all cursor-pointer"><X className="w-3 h-3" /></button>}
            </div>

            {tab === 'my' && (
              <div className="flex items-center gap-2">
                {(['all', 'draft', 'published'] as const).map((s) => (
                  <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer active:scale-95 ${statusFilter === s ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25' : 'bg-white text-surface-600 border border-surface-200 hover:border-brand-300 hover:text-brand-700'}`}>
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {tab === 'gallery' && (
              <div className="flex items-center gap-2 flex-wrap">
                {categoryNames.map((c) => (
                  <button key={c} onClick={() => setCategoryFilter(c)} className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer active:scale-95 ${categoryFilter === c ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25' : 'bg-white text-surface-600 border border-surface-200 hover:border-brand-300 hover:text-brand-700'}`}>{c}</button>
                ))}
              </div>
            )}

            <button onClick={() => tab === 'my' ? loadTemplates() : loadGallery()} className="p-2.5 bg-white border border-surface-200 rounded-xl text-surface-500 hover:text-brand-700 hover:border-brand-300 transition-all cursor-pointer" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3">
            <span className="text-rose-600 text-sm">{error}</span>
            <button onClick={() => tab === 'my' ? loadTemplates() : loadGallery()} className="ml-auto text-xs font-medium text-rose-700 hover:underline cursor-pointer">Retry</button>
          </div>
        )}

        {!isLoading && !error && (
          <p className="text-sm text-surface-500 mb-6">
            Showing <span className="font-semibold text-surface-900">{displayItems.length}</span> template{displayItems.length !== 1 ? 's' : ''}
            {tab === 'my' && totalPages > 1 && <span className="ml-1">(page {page} of {totalPages})</span>}
          </p>
        )}

        <div className="h-[calc(100vh-51vh)] overflow-auto">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-surface-200 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-44 bg-surface-100" />
                  <div className="p-5 space-y-3"><div className="h-4 bg-surface-100 rounded w-3/4" /><div className="h-3 bg-surface-100 rounded w-1/2" /><div className="h-8 bg-surface-100 rounded" /></div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && displayItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 px-4">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-surface-100 rounded-2xl flex items-center justify-center"><FolderOpen className="w-8 h-8 text-surface-400" /></div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-200 rounded-full flex items-center justify-center"><Search className="w-3 h-3 text-surface-500" /></div>
              </div>
              <h3 className="text-lg font-semibold text-surface-900 mb-2">{tab === 'my' ? 'No templates yet' : 'No gallery templates'}</h3>
              <p className="text-surface-500 text-sm text-center max-w-sm mb-6">{tab === 'my' ? (query ? `No templates match "${query}"` : 'Create your first template to get started') : (query ? `No results for "${query}"` : 'Gallery is empty')}</p>
              {tab === 'my' && (
                <button onClick={() => router.navigate({ to: '/builder' })} className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 transition-all cursor-pointer">
                  <Plus className="w-4 h-4" /> Create template
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && displayItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayItems.map((tpl, index) => (
                <div key={tpl._id} className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`} style={{ transitionDelay: `${250 + index * 40}ms` }}>
                  {tab === 'gallery' ? (
                    <TemplateCard
                      template={{ id: tpl._id, title: tpl.name, description: tpl.description || '', category: 'Gallery', data: tpl.editorData }}
                      onOpen={() => handleCopyFromGallery(tpl)}
                      actionLabel={actionLoading === tpl._id ? 'Copying...' : 'Use template'}
                    />
                  ) : (
                    <div className="group bg-white border border-surface-200 rounded-xl overflow-hidden shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200 relative">
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-md ${tpl.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-100 text-surface-600'}`}>{tpl.status}</span>
                      </div>
                      <div className="absolute top-3 right-3 z-10">
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === tpl._id ? null : tpl._id); }} className="w-7 h-7 rounded-lg bg-white/90 hover:bg-white shadow flex items-center justify-center text-surface-500 hover:text-surface-900 transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                          {actionLoading === tpl._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MoreVertical className="w-3.5 h-3.5" />}
                        </button>
                        {openMenu === tpl._id && (
                          <div className="absolute right-0 top-8 bg-white rounded-xl shadow-2xl border border-surface-100 py-1.5 w-44 z-20">
                            <button onClick={() => handleDuplicate(tpl)} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-surface-700 hover:bg-surface-50 hover:text-brand-700 transition-colors cursor-pointer"><Copy className="w-3.5 h-3.5" /> Duplicate</button>
                            <button onClick={() => { setDeleteTarget(tpl); setOpenMenu(null); }} className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                          </div>
                        )}
                      </div>
                      <div className="h-44 bg-surface-100 overflow-hidden relative cursor-pointer" onClick={() => openTemplate(tpl)}>
                        {tpl.compiledHtml ? (
                          <iframe srcDoc={tpl.compiledHtml} className="w-full h-full border-0 pointer-events-none" style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '167%', height: '167%' }} title={tpl.name} />
                        ) : (
                          <div className="flex items-center justify-center h-full"><LayoutTemplate className="w-10 h-10 text-surface-300" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-5">
                        <h3 className="text-sm font-semibold text-surface-900 truncate">{tpl.name}</h3>
                        {tpl.description && <p className="mt-1 text-xs text-surface-500 line-clamp-2 leading-relaxed">{tpl.description}</p>}
                        <div className="mt-2 flex items-center gap-2 text-xs text-surface-400"><span>v{tpl.version ?? 1}</span><span>·</span><span>{tpl.exportCount ?? 0} exports</span></div>
                        <button onClick={() => openTemplate(tpl)} className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 active:scale-[0.98] transition-all shadow-brand-sm hover:shadow-brand-md cursor-pointer">Open in Builder</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'my' && totalPages > 1 && !isLoading && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 text-sm font-medium bg-white border border-surface-200 rounded-xl text-surface-600 hover:text-brand-700 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">Previous</button>
              <span className="text-sm text-surface-500 px-2">{page} / {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 text-sm font-medium bg-white border border-surface-200 rounded-xl text-surface-600 hover:text-brand-700 hover:border-brand-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">Next</button>
            </div>
          )}
        </div>
      </main>

      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
      {deleteTarget && <ConfirmDialog message={`Delete "${deleteTarget.name}"? This cannot be undone.`} onConfirm={() => handleDelete(deleteTarget)} onCancel={() => setDeleteTarget(null)} />}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
