import React, { useMemo, useState } from 'react'
import AppHeader from '../ui/AppHeader'
import TemplateCard from './TemplateCard'
import PREDEFINED_TEMPLATES from '../../data/predefinedTemplates'
import { useRouter } from '@tanstack/react-router'

export default function TemplatesPage() {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('All')

    const categories = useMemo(() => ['All', ...Array.from(new Set(PREDEFINED_TEMPLATES.map((t) => t.category).filter(Boolean)))], [])

    const filtered = useMemo(() => {
        return PREDEFINED_TEMPLATES.filter((t) => (category === 'All' || t.category === category || !t.category) && (t.title.toLowerCase().includes(query.toLowerCase()) || (t.description || '').toLowerCase().includes(query.toLowerCase())))
    }, [query, category])

    const router = useRouter()

    function openTemplate(t: any) {
        try {
            // store selected template in localStorage so builder can pick it up on load
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

    return (
        <div className="min-h-screen bg-slate-50">
            <AppHeader />

            <main className="max-w-7xl mx-auto p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">Templates</h1>
                        <p className="text-sm text-slate-500">Choose a professional, responsive template to start quickly.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search templates..." className="px-3 py-2 border rounded-md w-64" />
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border rounded-md">
                            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <section>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((t) => (
                            <TemplateCard key={t.id} template={t} onOpen={openTemplate} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
