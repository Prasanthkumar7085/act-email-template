import React, { useState, useEffect } from 'react'
import { useRouter, useLocation } from '@tanstack/react-router'
import { Mail, LayoutTemplate, Hammer, User, LogOut, Bell } from 'lucide-react'

export default function AppHeader() {
    const router = useRouter()
    const location = useLocation()
    const [scrolled, setScrolled] = useState(false)

    // Track scroll for subtle shadow effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 8)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    function goHome() {
        router.navigate({ to: '/' })
    }

    function goTemplates() {
        router.navigate({ to: '/templates' })
    }

    function onLogout() {
        router.navigate({ to: '/signin' })
    }

    function onProfile() {
        alert('Profile settings coming soon')
    }

    const isActive = (path: string) => location.pathname === path

    return (
        <header 
            className={`
                w-full bg-white/95 backdrop-blur-md border-b border-surface-200/80 sticky top-0 z-40
                transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${scrolled ? 'shadow-lg shadow-surface-900/5' : 'shadow-none'}
            `}
        >
            <div className="w-full px-6 lg:px-10">
                <div className="flex items-center justify-between h-16">
                    {/* Left: Logo + Nav */}
                    <div className="flex items-center gap-8">
                        {/* Logo */}
                        <div 
                            className="flex items-center gap-2.5 cursor-pointer group transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-95"
                            onClick={goHome}
                        >
                            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105">
                                <Mail className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <span className="text-[15px] font-semibold text-surface-900 tracking-tight group-hover:text-brand-700 transition-colors duration-200">
                                Email Builder
                            </span>
                        </div>

                        {/* Navigation */}
                        <nav className="hidden sm:flex items-center gap-3">
                            <button
                                onClick={goTemplates}
                                className={`
                                    relative flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg 
                                    transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                                    cursor-pointer active:scale-95
                                    ${isActive('/templates') 
                                        ? 'text-brand-700 bg-brand-50' 
                                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                                    }
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1
                                `}
                            >
                                <LayoutTemplate className={`
                                    w-4 h-4 transition-transform duration-200 
                                    ${isActive('/templates') ? 'scale-110' : 'group-hover:scale-105'}
                                `} />
                                <span>Templates</span>
                            </button>
                            
                            <button
                                onClick={() => router.navigate({ to: '/builder' })}
                                className={`
                                    relative flex items-center gap-2 text-sm font-medium px-3.5 py-2 rounded-lg 
                                    transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                                    cursor-pointer active:scale-95
                                    ${isActive('/builder') 
                                        ? 'text-brand-700 bg-brand-50' 
                                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
                                    }
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1
                                `}
                            >
                                <Hammer className={`
                                    w-4 h-4 transition-transform duration-200
                                    ${isActive('/builder') ? 'scale-110' : ''}
                                `} />
                                <span>Builder</span>
                            </button>
                        </nav>
                    </div>

                    {/* Right: User actions */}
                    <div className="flex items-center gap-1">
                        {/* Email display */}
                        <span className="text-xs text-surface-500 hidden md:block mr-3 font-medium">
                            prasanth@orotron.com
                        </span>

                        {/* Notification button */}
                        <button
                            className="relative w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-900 hover:bg-surface-100 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1 group"
                            aria-label="Notifications"
                        >
                            <Bell className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                            {/* Animated notification badge */}
                            <span className="absolute top-1.5 right-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500 border-2 border-white"></span>
                                </span>
                            </span>
                        </button>

                        {/* Profile button */}
                        <button
                            onClick={onProfile}
                            className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center text-brand-700 hover:bg-brand-100 hover:text-brand-800 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1 group"
                            aria-label="Profile"
                        >
                            <User className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </button>

                        {/* Logout button */}
                        <button
                            onClick={onLogout}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 focus-visible:ring-offset-1 group"
                            aria-label="Logout"
                        >
                            <LogOut className="w-4 h-4 transition-all duration-200 group-hover:scale-110 group-hover:rotate-12" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}