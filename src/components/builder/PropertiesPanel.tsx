import React from 'react'
import StylingSection from './styling-panel/StylingSection'
import StylingRow from './styling-panel/StylingRow'
import { Layout, PaintBucket, Type, Maximize2, MoveHorizontal, MoveVertical, Pipette } from 'lucide-react'

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

    const defaultColors = [
        '#ffffff', '#000000', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#111827',
        '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
    ];

    const paddingPresets = [
        { label: '0', value: 0 },
        { label: 'S', value: 20 },
        { label: 'M', value: 40 },
        { label: 'L', value: 60 },
        { label: 'XL', value: 80 },
    ];

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Canvas Layout Section */}
            <StylingSection title="Canvas Layout" defaultOpen={true}>
                <StylingRow label="Width">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <input
                                type="number"
                                value={layout.width || 900}
                                onChange={(e) => onUpdatePageLayout({ width: Number(e.target.value) || 900 })}
                                className="w-full pl-2 pr-6 py-1.5 text-xs border border-gray-200 rounded text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">px</span>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                value={layout.maxWidth || 900}
                                onChange={(e) => onUpdatePageLayout({ maxWidth: Number(e.target.value) || 900 })}
                                className="w-full pl-2 pr-6 py-1.5 text-xs border border-gray-200 rounded text-gray-700 focus:outline-none focus:border-blue-500 bg-white"
                                placeholder="Max"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">max</span>
                        </div>
                    </div>
                </StylingRow>

                <StylingRow label="Border Radius">
                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="0"
                            max="32"
                            value={layout.borderRadius || 0}
                            onChange={(e) => onUpdatePageLayout({ borderRadius: Number(e.target.value) })}
                            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                        />
                        <div className="w-12 relative">
                            <input
                                type="number"
                                value={layout.borderRadius || 0}
                                onChange={(e) => onUpdatePageLayout({ borderRadius: Number(e.target.value) })}
                                className="w-full pl-1 pr-1 py-1 text-xs text-right border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                </StylingRow>
            </StylingSection>

            {/* Background Section */}
            <StylingSection title="Background" defaultOpen={true}>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <div
                                className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 cursor-pointer overflow-hidden relative ring-1 ring-transparent group-hover:ring-blue-500 transition-all"
                                style={{ backgroundColor: layout.background || '#ffffff' }}
                            >
                                <input
                                    type="color"
                                    value={layout.background || '#ffffff'}
                                    onChange={(e) => onUpdatePageLayout({ background: e.target.value })}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow border border-gray-100 pointer-events-none">
                                <Pipette className="w-2.5 h-2.5 text-gray-400" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center border border-gray-200 rounded-lg bg-white px-3 py-2 transition-all focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                                <span className="text-gray-400 text-xs mr-2 font-mono select-none">#</span>
                                <input
                                    type="text"
                                    value={(layout.background || '').replace('#', '')}
                                    onChange={(e) => onUpdatePageLayout({ background: `#${e.target.value}` })}
                                    className="w-full text-sm font-mono text-gray-700 focus:outline-none uppercase tracking-wide"
                                    placeholder="FFFFFF"
                                    maxLength={6}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-8 gap-2">
                        {defaultColors.map((color) => (
                            <button
                                key={color}
                                onClick={() => onUpdatePageLayout({ background: color })}
                                className={`w-full aspect-square rounded border border-gray-200 hover:scale-110 transition-transform ${(layout.background || '').toLowerCase() === color.toLowerCase()
                                    ? 'ring-2 ring-blue-500 ring-offset-1 border-transparent z-10'
                                    : 'hover:border-gray-300'
                                    }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                        <label className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2 block">Background Image</label>
                        <input
                            type="text"
                            value={layout.backgroundImage || ''}
                            onChange={(e) => onUpdatePageLayout({ backgroundImage: e.target.value })}
                            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-mono"
                            placeholder="https://example.com/bg.jpg"
                        />
                        {layout.backgroundImage && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <select
                                    className="px-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:border-blue-500"
                                    value={layout.backgroundSize || 'cover'}
                                    onChange={(e) => onUpdatePageLayout({ backgroundSize: e.target.value })}
                                >
                                    <option value="cover">Cover</option>
                                    <option value="contain">Contain</option>
                                    <option value="auto">Auto</option>
                                </select>
                                <select
                                    className="px-2 py-1.5 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:border-blue-500"
                                    value={layout.backgroundRepeat || 'no-repeat'}
                                    onChange={(e) => onUpdatePageLayout({ backgroundRepeat: e.target.value })}
                                >
                                    <option value="no-repeat">No Repeat</option>
                                    <option value="repeat">Repeat</option>
                                    <option value="repeat-x">Repeat X</option>
                                    <option value="repeat-y">Repeat Y</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </StylingSection>

            {/* Padding Section */}
            <StylingSection title="Canvas Padding" defaultOpen={true}>
                <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-1 bg-gray-50 p-1 rounded-lg border border-gray-100">
                        {paddingPresets.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => onUpdatePageLayout({
                                    padding: { top: preset.value, right: preset.value, bottom: preset.value, left: preset.value }
                                })}
                                className="py-1 text-[10px] font-medium text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm rounded transition-all"
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                            <label className="absolute left-2 top-1.5 text-[10px] text-gray-400 font-semibold">T</label>
                            <input
                                type="number"
                                value={layout.padding?.top || 0}
                                onChange={(e) => onUpdatePageLayout({ padding: { ...(layout.padding || {}), top: Number(e.target.value) } })}
                                className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded text-gray-700 focus:outline-none focus:border-blue-500 transition-all text-right"
                            />
                        </div>
                        <div className="relative group">
                            <label className="absolute left-2 top-1.5 text-[10px] text-gray-400 font-semibold">B</label>
                            <input
                                type="number"
                                value={layout.padding?.bottom || 0}
                                onChange={(e) => onUpdatePageLayout({ padding: { ...(layout.padding || {}), bottom: Number(e.target.value) } })}
                                className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded text-gray-700 focus:outline-none focus:border-blue-500 transition-all text-right"
                            />
                        </div>
                        <div className="relative group">
                            <label className="absolute left-2 top-1.5 text-[10px] text-gray-400 font-semibold">L</label>
                            <input
                                type="number"
                                value={layout.padding?.left || 0}
                                onChange={(e) => onUpdatePageLayout({ padding: { ...(layout.padding || {}), left: Number(e.target.value) } })}
                                className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded text-gray-700 focus:outline-none focus:border-blue-500 transition-all text-right"
                            />
                        </div>
                        <div className="relative group">
                            <label className="absolute left-2 top-1.5 text-[10px] text-gray-400 font-semibold">R</label>
                            <input
                                type="number"
                                value={layout.padding?.right || 0}
                                onChange={(e) => onUpdatePageLayout({ padding: { ...(layout.padding || {}), right: Number(e.target.value) } })}
                                className="w-full pl-6 pr-2 py-1.5 text-xs border border-gray-200 rounded text-gray-700 focus:outline-none focus:border-blue-500 transition-all text-right"
                            />
                        </div>
                    </div>
                </div>
            </StylingSection>

            {/* Global Settings */}
            <StylingSection title="Global Styles" defaultOpen={true}>
                <StylingRow label="Base Font">
                    <select
                        value={professionalOptions.fontFamily}
                        onChange={(e) => onUpdateProfessionalOptions({ fontFamily: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="Inter, system-ui, -apple-system, 'Segoe UI', Roboto">Inter</option>
                        <option value="Arial, Helvetica, sans-serif">Arial</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="'Courier New', Courier, monospace">Courier New</option>
                        <option value="'Times New Roman', Times, serif">Times New Roman</option>
                    </select>
                </StylingRow>
                <StylingRow label="Base Color" description="Default text color">
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={professionalOptions.baseColor || '#000000'}
                            onChange={(e) => onUpdateProfessionalOptions({ baseColor: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-xs text-gray-600 font-mono">{professionalOptions.baseColor}</span>
                    </div>
                </StylingRow>
            </StylingSection>
        </div>
    )
}
