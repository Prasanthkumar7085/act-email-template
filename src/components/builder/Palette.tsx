import React from 'react'

import PREDEFINED_TEMPLATES from '../../data/predefinedTemplates'

type InsertFn = (type: 'header' | 'paragraph' | 'image' | 'list' | 'delimiter') => void

export default function Palette({ insert, loadTemplate }: { insert?: InsertFn; loadTemplate: (data: any) => void }) {
    return (
        <div className="bg-white p-3 rounded h-full">
            <h4 className="font-semibold mb-2">Templates</h4>
            <div className="flex flex-col gap-2 mb-3">
                {PREDEFINED_TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => loadTemplate(t.data)} className="text-left px-3 py-2 bg-gray-50 rounded border hover:bg-gray-100 flex items-center gap-3">
                        {t.thumbnail && <img src={t.thumbnail} alt={t.title} className="w-12 h-8 object-cover rounded" />}
                        <div className="text-left">
                            <div className="font-medium">{t.title}</div>
                            {t.description && <div className="text-xs text-gray-500">{t.description}</div>}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
