
import React from 'react'
import PREDEFINED_TEMPLATES from '../../data/predefinedTemplates'
import { ArrowRight, LayoutTemplate, ImageIcon } from 'lucide-react'

type InsertFn = (type: 'header' | 'paragraph' | 'image' | 'list' | 'delimiter') => void

export default function Palette({ insert, loadTemplate }: { insert?: InsertFn; loadTemplate: (data: any) => void }) {
    // Count templates for badge
    const templateCount = PREDEFINED_TEMPLATES.length

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h4 className="font-semibold text-surface-900 text-sm">Template Library</h4>
                    <p className="text-xs text-surface-500 mt-0.5">
                        Professional layouts for EditorJS
                    </p>
                </div>
                <span className="text-[10px] font-medium bg-brand-50 text-brand-700 px-2 py-1 rounded-full border border-brand-100">
                    {templateCount} Available
                </span>
            </div>

            <div className="grid gap-3">
                {PREDEFINED_TEMPLATES.map((t) => (
                    <div
                        key={t.id}
                        className="group relative bg-white border border-surface-200 rounded-xl p-3 hover:border-brand-400 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                        onClick={() => loadTemplate(t.data)}
                    >
                        {/* Hover Decor */}
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center shadow-sm">
                                <ArrowRight className="w-3.5 h-3.5 text-white" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {/* Thumbnail */}
                            <div className="relative w-full h-24 bg-surface-100 rounded-lg overflow-hidden border border-surface-100 group-hover:border-brand-100 transition-colors">
                                {t.thumbnail ? (
                                    <img
                                        src={t.thumbnail}
                                        alt={t.title}
                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-surface-300">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-semibold text-surface-900 text-sm truncate group-hover:text-brand-700 transition-colors">
                                        {t.title}
                                    </h5>
                                </div>

                                {t.description && (
                                    <p className="text-xs text-surface-500 line-clamp-2 leading-relaxed mb-2.5">
                                        {t.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-2">
                                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-50 border border-surface-100 text-[10px] font-medium text-surface-500">
                                        <LayoutTemplate className="w-3 h-3" />
                                        {t.data?.blocks?.length || 0} Blocks
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom interaction hint */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                    </div>
                ))}
            </div>
        </div>
    )
}
