import React from 'react'
import { ArrowRight, Star } from 'lucide-react'

export default function TemplateCard({ template, onOpen }: { template: any; onOpen: (t: any) => void }) {
    return (
        <div className="group bg-white border border-surface-200 rounded-xl overflow-hidden shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-200">
            <div className="h-44 bg-surface-100 overflow-hidden relative">
                <img
                    src={template.thumbnail || 'https://via.placeholder.com/480x240'}
                    alt={template.title}
                    className="object-cover h-full w-full group-hover:scale-[1.03] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-surface-900 truncate">{template.title}</h3>
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs font-medium rounded-md">{template.category}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-500 flex-shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-medium">{template.rating || 4.8}</span>
                    </div>
                </div>

                <p className="mt-3 text-xs text-surface-500 line-clamp-2 leading-relaxed">{template.description}</p>

                <button
                    onClick={() => onOpen(template)}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-brand-700 text-white rounded-lg text-sm font-medium hover:bg-brand-800 active:scale-[0.98] transition-all shadow-brand-sm hover:shadow-brand-md"
                >
                    Use template
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}
