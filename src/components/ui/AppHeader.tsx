import { useState, useEffect } from 'react'
import { useRouter, useLocation } from '@tanstack/react-router'
import { Mail, LayoutTemplate, Hammer, Settings, User, LogOut, Bell, ChevronDown } from 'lucide-react'
import { useAuth } from '../../store/authContext'

export default function AppHeader() {
    const router = useRouter()
    const location = useLocation()
    const { user, workspace, workspaces, switchWorkspace, logout } = useAuth()
    const [scrolled, setScrolled] = useState(false)
    const [wsOpen, setWsOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 8)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    async function onLogout() {
        await logout()
        router.navigate({ to: '/' })
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <header className={`w-full bg-white/95 backdrop-blur-md border-b border-surface-200/80 sticky top-0 z-40 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${scrolled ? 'shadow-lg shadow-surface-900/5' : 'shadow-none'}`}>
            <div className="w-full px-6 lg:px-10">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2.5 cursor-pointer group transition-transform duration-200 active:scale-95" onClick={() => router.navigate({ to: '/templates' })}>
                            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/30 transition-all duration-300 group-hover:scale-105">
                                <Mail className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-[15px] font-semibold text-surface-900 tracking-tight group-hover:text-brand-700 transition-colors duration-200">Email Builder</span>
                        </div>
                        <nav className="hidden sm:flex items-center gap-3">
                            <button onClick={() => router.navigate({ to: '/templates' })} className={`relative flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${isActive('/templates') ? 'text-brand-700 bg-brand-50' : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'}`}>
                                <LayoutTemplate className="w-4 h-4" /><span>Templates</span>
                            </button>
                            <button onClick={() => router.navigate({ to: '/builder' })} className={`relative flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${isActive('/builder') ? 'text-brand-700 bg-brand-50' : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'}`}>
                                <Hammer className="w-4 h-4" /><span>Builder</span>
                            </button>
                            <button onClick={() => router.navigate({ to: '/settings/workspace' })} className={`relative flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 cursor-pointer active:scale-95 ${isActive('/settings/workspace') ? 'text-brand-700 bg-brand-50' : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'}`}>
                                <Settings className="w-4 h-4" /><span>Settings</span>
                            </button>
                        </nav>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Workspace switcher — always visible when workspaces loaded */}
                        {workspaces.length > 0 && (
                            <div className="relative hidden md:block mr-2">
                                <button onClick={() => setWsOpen(!wsOpen)} className="flex items-center gap-1.5 text-xs text-surface-600 font-medium px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-100 border border-surface-200 transition-all cursor-pointer">
                                    <span className="max-w-[140px] truncate">{workspace?.name || 'Workspace'}</span>
                                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                                </button>
                                {wsOpen && (
                                    <div className="absolute right-0 top-9 bg-white rounded-xl shadow-2xl border border-surface-100 py-1.5 w-56 z-20">
                                        <p className="px-3.5 pt-1 pb-2 text-[10px] font-semibold text-surface-400 uppercase tracking-wider">Your Workspaces</p>
                                        {workspaces.map((ws) => (
                                            <button key={ws._id} onClick={() => { switchWorkspace(ws); setWsOpen(false); }} className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-sm transition-colors cursor-pointer ${ws._id === workspace?._id ? 'text-brand-700 bg-brand-50 font-medium' : 'text-surface-700 hover:bg-surface-50'}`}>
                                                <div className="w-6 h-6 rounded-md bg-brand-100 flex items-center justify-center text-brand-700 text-[10px] font-bold flex-shrink-0">
                                                    {ws.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="truncate">{ws.name}</span>
                                                {ws._id === workspace?._id && <span className="ml-auto text-[10px] text-brand-500 font-semibold">Active</span>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User email */}
                        {user && <span className="text-xs text-surface-500 hidden md:block mr-2 font-medium truncate max-w-[160px]">{user.email}</span>}

                        {/* Notification */}
                        <button className="relative w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-all cursor-pointer group" aria-label="Notifications">
                            <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="absolute top-1.5 right-1.5"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500 border-2 border-white"></span></span></span>
                        </button>

                        {/* Profile */}
                        <button className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center text-brand-700 hover:bg-brand-100 transition-all cursor-pointer group" aria-label="Profile">
                            {user?.avatar ? <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" alt={user.name} /> : <User className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                        </button>

                        {/* Logout */}
                        <button onClick={onLogout} className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer group" aria-label="Logout">
                            <LogOut className="w-4 h-4 group-hover:scale-110 group-hover:rotate-12 transition-all" />
                        </button>
                    </div>
                </div>
            </div>
            {wsOpen && <div className="fixed inset-0 z-10" onClick={() => setWsOpen(false)} />}
        </header>
    )
}
