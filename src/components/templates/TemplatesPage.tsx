import React, { useMemo, useState, useEffect } from 'react'
import AppHeader from '../ui/AppHeader'
import TemplateCard from './TemplateCard'
import PREDEFINED_TEMPLATES from '../../data/predefinedTemplates'
import { useRouter } from '@tanstack/react-router'
import { Search, Plus, Sparkles, FolderOpen } from 'lucide-react'

export default function TemplatesPage() {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('All')
    const [isLoaded, setIsLoaded] = useState(false)

    // Trigger entrance animations
    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 50)
        return () => clearTimeout(timer)
    }, [])

    const categories = useMemo(() => ['All', ...Array.from(new Set(PREDEFINED_TEMPLATES.map((t) => t.category).filter(Boolean)))], [])

    const filtered = useMemo(() => {
        return PREDEFINED_TEMPLATES.filter((t) => (category === 'All' || t.category === category || !t.category) && (t.title.toLowerCase().includes(query.toLowerCase()) || (t.description || '').toLowerCase().includes(query.toLowerCase())))
    }, [query, category])

    const router = useRouter()

    function openTemplate(t: any) {
        try {
            if (t.data) {
                localStorage.setItem('selectedTemplate', JSON.stringify(t.data))
            } else {
                localStorage.setItem('selectedTemplate', JSON.stringify({ time: Date.now(), blocks: [], version: '2.30.8' }))
            }
        } catch (err) {
            console.warn('Could not store template:', err)
        }

        router.navigate({ to: '/builder' })
    }

    function clearFilters() {
        setQuery('')
        setCategory('All')
    }

    return (
        <div className="h-full bg-gradient-to-br from-surface-50 via-white to-surface-100/50">
            <AppHeader />

            <main className="w-full px-6 lg:px-10 py-10 lg:py-14  max-w-[95%] mx-auto">
                {/* Page Header Section */}
                <div 
                    className={`
                        transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}
                >
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-brand-500" />
                                <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">Template Gallery</span>
                            </div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-surface-900 tracking-tight">
                                Choose a template
                            </h1>
                            <p className="text-surface-500 text-base max-w-md leading-relaxed">
                                Start with a professionally designed template or create from scratch. All templates are fully customizable.
                            </p>
                        </div>
                        
                        <button
                            onClick={() => router.navigate({ to: '/builder' })}
                            className="
                                group flex items-center gap-2.5 px-5 py-3 
                                bg-brand-600 text-white rounded-xl text-sm font-semibold 
                                shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30
                                hover:bg-brand-700 hover:-translate-y-0.5
                                active:translate-y-0 active:scale-[0.98]
                                transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                                cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2
                                self-start lg:self-auto
                            "
                        >
                            <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center transition-transform duration-300 group-hover:rotate-90">
                                <Plus className="w-3 h-3" />
                            </div>
                            Start from blank
                        </button>
                    </div>
                </div>

                {/* Filters Section */}
                <div 
                    className={`
                        transition-all duration-700 delay-100 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}
                >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-5 mb-10 p-1">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 transition-colors duration-200 group-focus-within:text-brand-500">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="
                                    w-full pl-11 pr-4 py-3 
                                    bg-white border border-surface-200 rounded-xl 
                                    text-sm text-surface-900 placeholder-surface-400 
                                    focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500
                                    hover:border-surface-300 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                                    shadow-sm shadow-surface-900/5
                                "
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-surface-200 hover:bg-surface-300 flex items-center justify-center text-surface-500 hover:text-surface-700 transition-all duration-200 cursor-pointer"
                                >
                                    <span className="text-xs">×</span>
                                </button>
                            )}
                        </div>

                        {/* Category Pills */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {categories.map((c, index) => (
                                <button
                                    key={c}
                                    onClick={() => setCategory(c)}
                                    className={`
                                        relative px-4 py-2.5 rounded-xl text-sm font-medium 
                                        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                                        cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1
                                        ${category === c
                                            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25'
                                            : 'bg-white text-surface-600 border border-surface-200 hover:border-brand-300 hover:text-brand-700 hover:shadow-md hover:shadow-surface-900/5'
                                        }
                                    `}
                                    style={{ 
                                        transitionDelay: `${150 + index * 30}ms` 
                                    }}
                                >
                                    {c}
                                    {category === c && (
                                        <span className="absolute inset-0 rounded-xl bg-white/10 animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div 
                    className={`
                        mb-6 transition-all duration-700 delay-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                    `}
                >
                    <p className="text-sm text-surface-500">
                        Showing <span className="font-semibold text-surface-900">{filtered.length}</span> template{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="h-[calc(100vh-51vh)] overflow-auto">

                {/* Results Grid */}
                {filtered.length === 0 ? (
                    <div 
                        className={`
                            flex flex-col items-center justify-center py-24 px-4
                            transition-all duration-700 delay-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                            ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                        `}
                    >
                        <div className="relative mb-6">
                            <div className="w-20 h-20 bg-surface-100 rounded-2xl flex items-center justify-center">
                                <FolderOpen className="w-8 h-8 text-surface-400" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface-200 rounded-full flex items-center justify-center">
                                <Search className="w-3 h-3 text-surface-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-surface-900 mb-2">No templates found</h3>
                        <p className="text-surface-500 text-sm text-center max-w-sm mb-6">
                            We couldn't find any templates matching "{query}"{category !== 'All' ? ` in ${category}` : ''}.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="
                                px-5 py-2.5 bg-white border border-surface-200 text-surface-700 
                                rounded-xl text-sm font-medium hover:border-brand-300 hover:text-brand-700
                                transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                                cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-1
                                shadow-sm shadow-surface-900/5 hover:shadow-md
                            "
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((t, index) => (
                            <div
                                key={t.id}
                                className={`
                                    transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                                    ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                                `}
                                style={{ 
                                    transitionDelay: `${250 + index * 50}ms` 
                                }}
                            >
                                <TemplateCard template={t} onOpen={openTemplate} />
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </main>
        </div>
    )
}