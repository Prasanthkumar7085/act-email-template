import React from 'react'

type InsertFn = (type: 'header' | 'paragraph' | 'image' | 'list' | 'delimiter') => void

const TEMPLATES: { id: string; title: string; data: any }[] = [
    {
        id: 'simple-newsletter',
        title: 'Simple Newsletter',
        data: {
            time: Date.now(),
            blocks: [
                { type: 'header', data: { text: 'Monthly Newsletter' } },
                { type: 'paragraph', data: { text: 'Welcome to our monthly newsletter. Lots of good things inside.' } },
                { type: 'image', data: { file: { url: 'https://via.placeholder.com/600x200' }, caption: '' } },
                { type: 'paragraph', data: { text: 'Thanks for reading — stay tuned for more updates.' } },
            ],
            version: '2.30.8',
        },
    },
    {
        id: 'promo',
        title: 'Promotional',
        data: {
            time: Date.now(),
            blocks: [
                { type: 'header', data: { text: 'Big Sale — 50% Off' } },
                { type: 'paragraph', data: { text: 'Limited time offer on all products. Use code SAVE50.' } },
                { type: 'image', data: { file: { url: 'https://via.placeholder.com/600x260' }, caption: '' } },
                { type: 'paragraph', data: { text: 'Shop now and save big!' } },
            ],
            version: '2.30.8',
        },
    },
]

export default function Palette({ insert, loadTemplate }: { insert: InsertFn; loadTemplate: (data: any) => void }) {
    return (
        <div className="bg-slate-50 p-3 rounded shadow-sm">
            <h4 className="font-semibold mb-2">Templates</h4>
            <div className="flex flex-col gap-2 mb-3">
                {TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => loadTemplate(t.data)} className="text-left px-3 py-2 bg-white rounded border hover:bg-slate-100">
                        {t.title}
                    </button>
                ))}
            </div>

            <h4 className="font-semibold mb-2">Insert Block</h4>
            <div className="flex flex-col gap-2">
                <button onClick={() => insert('header')} className="text-left px-3 py-2 bg-white rounded border hover:bg-slate-100">
                    Header
                </button>
                <button onClick={() => insert('paragraph')} className="text-left px-3 py-2 bg-white rounded border hover:bg-slate-100">
                    Paragraph
                </button>
                <button onClick={() => insert('image')} className="text-left px-3 py-2 bg-white rounded border hover:bg-slate-100">
                    Image
                </button>
                <button onClick={() => insert('list')} className="text-left px-3 py-2 bg-white rounded border hover:bg-slate-100">
                    List
                </button>
                <button onClick={() => insert('delimiter')} className="text-left px-3 py-2 bg-white rounded border hover:bg-slate-100">
                    Divider
                </button>
            </div>
        </div>
    )
}
