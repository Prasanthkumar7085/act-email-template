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
    const layout = pageLayouts?.[0] || {
        background: '#ffffff',
        backgroundImage: '',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        margins: { top: 40, right: 0, bottom: 0, left: 0 },
        padding: { top: 40, right: 40, bottom: 40, left: 40 },
        width: 900,
        maxWidth: 900,
        borderRadius: 8,
    }

    return (
        <div className="bg-slate-50 p-3 rounded shadow-sm">
            <h4 className="font-semibold mb-2">Page & Canvas Settings</h4>

            <div className="flex flex-col gap-2 mb-3">
                <label className="text-xs">Background Color</label>
                <input type="color" value={layout.background || '#ffffff'} onChange={(e) => onUpdatePageLayout({ background: e.target.value })} />
                <label className="text-xs">Background Image URL</label>
                <input
                    type="text"
                    className="px-2 py-1 border rounded"
                    value={layout.backgroundImage || ''}
                    onChange={(e) => onUpdatePageLayout({ backgroundImage: e.target.value })}
                    placeholder="https://example.com/bg.png"
                />
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs">Background Size</label>
                        <select
                            className="px-2 py-1 border rounded text-sm"
                            value={layout.backgroundSize || 'cover'}
                            onChange={(e) => onUpdatePageLayout({ backgroundSize: e.target.value })}
                        >
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs">Background Repeat</label>
                        <select
                            className="px-2 py-1 border rounded text-sm"
                            value={layout.backgroundRepeat || 'no-repeat'}
                            onChange={(e) => onUpdatePageLayout({ backgroundRepeat: e.target.value })}
                        >
                            <option value="no-repeat">No Repeat</option>
                            <option value="repeat">Repeat</option>
                            <option value="repeat-x">Repeat X</option>
                            <option value="repeat-y">Repeat Y</option>
                        </select>
                    </div>
                </div>

                <label className="text-xs">Canvas Width (px)</label>
                <input
                    type="number"
                    className="px-2 py-1 border rounded"
                    value={layout.width || 900}
                    onChange={(e) => onUpdatePageLayout({ width: Number(e.target.value) || 900 })}
                />

                <label className="text-xs">Max Width (px)</label>
                <input
                    type="number"
                    className="px-2 py-1 border rounded"
                    value={layout.maxWidth || 900}
                    onChange={(e) => onUpdatePageLayout({ maxWidth: Number(e.target.value) || 900 })}
                />

                <label className="text-xs">Border Radius (px)</label>
                <input
                    type="number"
                    className="px-2 py-1 border rounded"
                    value={layout.borderRadius || 0}
                    onChange={(e) => onUpdatePageLayout({ borderRadius: Number(e.target.value) || 0 })}
                />

                <label className="text-xs">Top Margin (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.margins?.top || 40} onChange={(e) => onUpdatePageLayout({ margins: { ...(layout.margins || {}), top: Number(e.target.value) } })} />

                <label className="text-xs">Right Margin (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.margins?.right || 0} onChange={(e) => onUpdatePageLayout({ margins: { ...(layout.margins || {}), right: Number(e.target.value) } })} />

                <label className="text-xs">Left Margin (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.margins?.left || 0} onChange={(e) => onUpdatePageLayout({ margins: { ...(layout.margins || {}), left: Number(e.target.value) } })} />

                <label className="text-xs">Bottom Margin (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.margins?.bottom || 0} onChange={(e) => onUpdatePageLayout({ margins: { ...(layout.margins || {}), bottom: Number(e.target.value) } })} />

                <label className="text-xs">Padding Top (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.padding?.top || 40} onChange={(e) => onUpdatePageLayout({ padding: { ...(layout.padding || {}), top: Number(e.target.value) } })} />

                <label className="text-xs">Padding Right (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.padding?.right || 40} onChange={(e) => onUpdatePageLayout({ padding: { ...(layout.padding || {}), right: Number(e.target.value) } })} />

                <label className="text-xs">Padding Bottom (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.padding?.bottom || 40} onChange={(e) => onUpdatePageLayout({ padding: { ...(layout.padding || {}), bottom: Number(e.target.value) } })} />

                <label className="text-xs">Padding Left (px)</label>
                <input type="number" className="px-2 py-1 border rounded" value={layout.padding?.left || 40} onChange={(e) => onUpdatePageLayout({ padding: { ...(layout.padding || {}), left: Number(e.target.value) } })} />
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
