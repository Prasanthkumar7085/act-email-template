import React from 'react'

export default function Toolbar({ onExport, onPreview, onClear }: { onExport: () => void; onPreview: () => void; onClear: () => void }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
                <button onClick={onPreview} className="px-3 py-1 bg-surface-800 text-white rounded">Preview</button>
                <button onClick={onExport} className="px-3 py-1 bg-brand-500 text-white rounded">Export</button>
            </div>

            <div>
                <button onClick={onClear} className="px-3 py-1 border rounded text-sm">Clear</button>
            </div>
        </div>
    )
}
