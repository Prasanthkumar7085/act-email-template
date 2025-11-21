import React from 'react'
import { useRouter } from '@tanstack/react-router'

export default function AppHeader() {
    const router = useRouter()

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

    return (
        <header className="w-full bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
                        <div className="w-10 h-10 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">ET</div>
                        <div>
                            <div className="text-lg font-semibold">Email Template</div>
                            <div className="text-xs text-slate-500">Designer</div>
                        </div>
                    </div>

                    <nav className="flex items-center gap-4">
                        <button onClick={goTemplates} className="text-sm px-3 py-2 rounded hover:bg-slate-100">Templates</button>
                        <button onClick={() => router.navigate({ to: '/builder' })} className="text-sm px-3 py-2 rounded hover:bg-slate-100">Builder</button>
                    </nav>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-600">prasanth@orotron.com</div>
                        <div className="relative">
                            <button onClick={onProfile} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 text-sm">PR</div>
                                <span className="text-sm">Profile</span>
                            </button>
                            <div className="absolute right-0 mt-10 bg-white border rounded shadow-lg hidden" id="profile-menu">
                                <button onClick={onProfile} className="w-full text-left px-3 py-2 hover:bg-slate-50">Settings</button>
                                <button onClick={onLogout} className="w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
