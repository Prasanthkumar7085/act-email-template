import React, { useMemo, useState } from 'react'
import AppHeader from '../ui/AppHeader'
import TemplateCard from './TemplateCard'

const TEMPLATES = [
    { id: 't1', title: 'Newsletter Classic', category: 'Newsletter', description: 'A clean newsletter layout with hero image and CTA.', thumbnail: 'https://via.placeholder.com/600x300' },
    { id: 't2', title: 'Product Promo', category: 'Promotional', description: 'Bold product-centric promo template with big CTA.', thumbnail: 'https://via.placeholder.com/600x300' },
    { id: 't3', title: 'Event Invite', category: 'Invitation', description: 'Invite template for webinars & events.', thumbnail: 'https://via.placeholder.com/600x300' },
    { id: 't4', title: 'Digest', category: 'Newsletter', description: 'Short digest with multiple cards and links.', thumbnail: 'https://via.placeholder.com/600x300' },
    { id: 't5', title: 'Sale Banner', category: 'Promotional', description: 'Header-first sale focused template.', thumbnail: 'https://via.placeholder.com/600x300' },
]

export default function TemplatesPage() {
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState('All')

    const categories = useMemo(() => ['All', ...Array.from(new Set(TEMPLATES.map((t) => t.category)))], [])

    const filtered = useMemo(() => {
        return TEMPLATES.filter((t) => (category === 'All' || t.category === category) && (t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase())))
    }, [query, category])

    function openTemplate(t: any) {
        alert(`Load template: ${t.title} into builder`)
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
