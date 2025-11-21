import React from 'react'

export default function PropertiesPanel({
    pageLayouts,
    onUpdatePageLayout,
    professionalOptions,
    onUpdateProfessionalOptions,
}: {
    pageLayouts: any
    onUpdatePageLayout: (partial: any) => void
    professionalOptions: { fontFamily: string; baseColor: string }
    onUpdateProfessionalOptions: (partial: any) => void
}) {
    const layout = pageLayouts?.[0] || { background: '#ffffff', margins: { top: 40, right: 0, bottom: 0, left: 0 } }

    return (
        <div className="bg-slate-50 p-3 rounded shadow-sm">
            <h4 className="font-semibold mb-2">Page & Canvas Settings</h4>

            <div className="flex flex-col gap-2 mb-3">
                <label className="text-xs">Background Color</label>
                <input type="color" value={layout.background || '#ffffff'} onChange={(e) => onUpdatePageLayout({ background: e.target.value })} />

                <label className="text-xs">Top Margin (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.margins?.top || 40} onChange={(e) => onUpdatePageLayout({ margins: { ...(layout.margins || {}), top: Number(e.target.value) } })} />

                <label className="text-xs">Left Margin (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.margins?.left || 0} onChange={(e) => onUpdatePageLayout({ margins: { ...(layout.margins || {}), left: Number(e.target.value) } })} />
            </div>

            <h4 className="font-semibold mb-2">Professional Options</h4>
            <div className="flex flex-col gap-2">
                <label className="text-xs">Base Font</label>
                <select value={professionalOptions.fontFamily} onChange={(e) => onUpdateProfessionalOptions({ fontFamily: e.target.value })} className="px-2 py-1 border rounded">
                    <option value="Inter, system-ui, -apple-system, 'Segoe UI', Roboto">Inter</option>
                    <option value="Arial, Helvetica, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                </select>

                <label className="text-xs">Base Color</label>
                <input type="color" value={professionalOptions.baseColor} onChange={(e) => onUpdateProfessionalOptions({ baseColor: e.target.value })} />
            </div>
        </div>
    )
}
