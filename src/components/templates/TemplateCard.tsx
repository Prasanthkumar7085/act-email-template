import React from 'react'

export default function TemplateCard({ template, onOpen }: { template: any; onOpen: (t: any) => void }) {
    return (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="h-40 bg-slate-100 flex items-center justify-center">
                <img src={template.thumbnail || 'https://via.placeholder.com/480x240'} alt={template.title} className="object-cover h-full w-full" />
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-md font-semibold">{template.title}</h3>
                        <p className="text-sm text-slate-500">{template.category}</p>
                    </div>
                    <div className="text-xs text-slate-400">⭐ {template.rating || 4.8}</div>
                </div>

                <p className="mt-3 text-sm text-slate-600 line-clamp-2">{template.description}</p>

                <div className="mt-4 flex items-center justify-between">
                    <button onClick={() => onOpen(template)} className="px-3 py-1 bg-cyan-500 text-white rounded-md text-sm">Use</button>
                    <div className="text-xs text-slate-400">{template.readTime || '1 min'}</div>
                </div>
            </div>
        </div>
    )
}
