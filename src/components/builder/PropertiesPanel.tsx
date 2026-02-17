import React, { useState, useEffect } from 'react'
import { 
    ChevronDown, 
    Pipette, 
    Maximize2, 
    Layout, 
    Type, 
    Image as ImageIcon,
    Grid3X3
} from 'lucide-react'

// Animated Section Component
function AnimatedSection({ 
    title, 
    icon: Icon, 
    children, 
    defaultOpen = true,
    delay = 0
}: { 
    title: string
    icon: React.ElementType
    children: React.ReactNode
    defaultOpen?: boolean
    delay?: number
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), delay)
        return () => clearTimeout(timer)
    }, [delay])

    return (
        <div 
            className={`
                border-b border-surface-100 last:border-b-0
                transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="
                    w-full flex items-center justify-between p-4 
                    hover:bg-surface-50/80 transition-colors duration-200
                    cursor-pointer group
                "
            >
                <div className="flex items-center gap-3">
                    <div className="
                        w-7 h-7 rounded-lg bg-surface-100 
                        flex items-center justify-center
                        group-hover:bg-brand-50 group-hover:text-brand-600
                        transition-all duration-200
                    ">
                        <Icon className="w-3.5 h-3.5 text-surface-500 group-hover:text-brand-600 transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-surface-900">{title}</span>
                </div>
                <ChevronDown 
                    className={`
                        w-4 h-4 text-surface-400 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${isOpen ? 'rotate-180' : 'rotate-0'}
                    `} 
                />
            </button>
            
            <div 
                className={`
                    overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                <div className="px-4 pb-5">
                    {children}
                </div>
            </div>
        </div>
    )
}

// Input Field Component
function InputField({ 
    label, 
    value, 
    onChange, 
    suffix, 
    prefix,
    type = 'text',
    min,
    max,
    placeholder
}: { 
    label?: string
    value: string | number
    onChange: (val: string) => void
    suffix?: string
    prefix?: string
    type?: string
    min?: number
    max?: number
    placeholder?: string
}) {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative group">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-400 font-medium">
                        {prefix}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    min={min}
                    max={max}
                    placeholder={placeholder}
                    className={`
                        w-full py-2 text-sm text-surface-900 
                        bg-white border border-surface-200 rounded-lg
                        placeholder:text-surface-400
                        focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                        hover:border-surface-300
                        transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                        ${prefix ? 'pl-7' : 'pl-3'}
                        ${suffix ? 'pr-10' : 'pr-3'}
                    `}
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-400 font-medium">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    )
}

// Color Swatch Component
function ColorSwatch({ 
    color, 
    isSelected, 
    onClick 
}: { 
    color: string
    isSelected: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={`
                relative w-full aspect-square rounded-lg 
                transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                cursor-pointer
                ${isSelected 
                    ? 'ring-2 ring-brand-500 ring-offset-2 scale-110 z-10' 
                    : 'hover:scale-105 hover:shadow-md'
                }
            `}
            style={{ backgroundColor: color }}
            title={color}
        >
            {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                </div>
            )}
        </button>
    )
}

// Range Slider Component
function RangeSlider({ 
    value, 
    min, 
    max, 
    onChange, 
    suffix 
}: { 
    value: number
    min: number
    max: number
    onChange: (val: number) => void
    suffix?: string
}) {
    const percentage = ((value - min) / (max - min)) * 100

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="
                        w-full h-1.5 bg-surface-200 rounded-full appearance-none cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-4
                        [&::-webkit-slider-thumb]:h-4
                        [&::-webkit-slider-thumb]:bg-brand-500
                        [&::-webkit-slider-thumb]:rounded-full
                        [&::-webkit-slider-thumb]:shadow-md
                        [&::-webkit-slider-thumb]:shadow-brand-500/30
                        [&::-webkit-slider-thumb]:transition-transform
                        [&::-webkit-slider-thumb]:duration-150
                        [&::-webkit-slider-thumb]:hover:scale-110
                        [&::-webkit-slider-thumb]:active:scale-95
                    "
                    style={{
                        background: `linear-gradient(to right, #6366f1 ${percentage}%, #e5e7eb ${percentage}%)`
                    }}
                />
            </div>
            <div className="w-14">
                <InputField
                    value={value}
                    onChange={(v) => onChange(Number(v))}
                    suffix={suffix}
                    type="number"
                />
            </div>
        </div>
    )
}

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
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 50)
        return () => clearTimeout(timer)
    }, [])

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
        '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#0f172a',
        '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626',
        '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c',
        '#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04',
        '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a',
        '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb',
        '#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#7c3aed',
    ]

    const paddingPresets = [
        { label: 'None', value: 0 },
        { label: 'S', value: 16 },
        { label: 'M', value: 32 },
        { label: 'L', value: 48 },
        { label: 'XL', value: 64 },
    ]

    const fontOptions = [
        { value: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto", label: 'Inter' },
        { value: "Arial, Helvetica, sans-serif", label: 'Arial' },
        { value: "Georgia, 'Times New Roman', serif", label: 'Georgia' },
        { value: "'Courier New', Courier, monospace", label: 'Monospace' },
        { value: "'Times New Roman', Times, serif", label: 'Times' },
        { value: "Helvetica, Arial, sans-serif", label: 'Helvetica' },
    ]

    const applyPaddingPreset = (value: number) => {
        onUpdatePageLayout({
            padding: { top: value, right: value, bottom: value, left: value }
        })
    }

    return (
        <div className="flex flex-col h-full bg-white custom-scrollbar overflow-y-auto">


            {/* Sections */}
            <div className="flex-1 pb-6">
                {/* Canvas Layout Section */}
                <AnimatedSection title="Canvas Layout" icon={Maximize2} defaultOpen={true} delay={100}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <InputField
                                label="Width"
                                value={layout.width || 900}
                                onChange={(v) => onUpdatePageLayout({ width: Number(v) || 900 })}
                                suffix="px"
                                type="number"
                            />
                            <InputField
                                label="Max Width"
                                value={layout.maxWidth || 900}
                                onChange={(v) => onUpdatePageLayout({ maxWidth: Number(v) || 900 })}
                                suffix="px"
                                type="number"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                                Border Radius
                            </label>
                            <RangeSlider
                                value={layout.borderRadius || 0}
                                min={0}
                                max={32}
                                onChange={(v) => onUpdatePageLayout({ borderRadius: v })}
                                suffix="px"
                            />
                        </div>
                    </div>
                </AnimatedSection>

                {/* Background Section */}
                <AnimatedSection title="Background" icon={Layout} defaultOpen={true} delay={150}>
                    <div className="space-y-4">
                        {/* Color Picker */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                                Background Color
                            </label>
                            
                            <div className="flex items-center gap-3">
                                {/* Color Preview Button */}
                                <div className="relative group">
                                    <button
                                        className="
                                            w-12 h-12 rounded-xl shadow-md border-2 border-white 
                                            ring-1 ring-surface-200 overflow-hidden
                                            transition-all duration-200 hover:scale-105 hover:shadow-lg
                                            cursor-pointer
                                        "
                                        style={{ backgroundColor: layout.background || '#ffffff' }}
                                        onClick={() => document.getElementById('bg-color-picker')?.click()}
                                    >
                                        <input
                                            id="bg-color-picker"
                                            type="color"
                                            value={layout.background || '#ffffff'}
                                            onChange={(e) => onUpdatePageLayout({ background: e.target.value })}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                    </button>
                                    <div className="
                                        absolute -bottom-1 -right-1 w-5 h-5 
                                        bg-white rounded-full shadow-md border border-surface-100
                                        flex items-center justify-center
                                    ">
                                        <Pipette className="w-2.5 h-2.5 text-surface-500" />
                                    </div>
                                </div>

                                {/* Hex Input */}
                                <div className="flex-1">
                                    <div className="
                                        flex items-center border border-surface-200 rounded-xl 
                                        bg-white px-3 py-2.5
                                        focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500
                                        hover:border-surface-300
                                        transition-all duration-200
                                    ">
                                        <span className="text-surface-400 text-sm font-mono select-none mr-1">#</span>
                                        <input
                                            type="text"
                                            value={(layout.background || '').replace('#', '')}
                                            onChange={(e) => onUpdatePageLayout({ background: `#${e.target.value}` })}
                                            className="w-full text-sm font-mono text-surface-900 focus:outline-none uppercase tracking-wide"
                                            placeholder="FFFFFF"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Color Palette */}
                            <div className="grid grid-cols-7 gap-3 pt-1">
                                {defaultColors.map((color) => (
                                    <ColorSwatch
                                        key={color}
                                        color={color}
                                        isSelected={(layout.background || '').toLowerCase() === color.toLowerCase()}
                                        onClick={() => onUpdatePageLayout({ background: color })}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Background Image */}
                        <div className="pt-3 border-t border-surface-100 space-y-3">
                            <label className="text-[11px] font-medium text-surface-500 uppercase tracking-wider flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" />
                                Background Image
                            </label>
                            
                            <input
                                type="text"
                                value={layout.backgroundImage || ''}
                                onChange={(e) => onUpdatePageLayout({ backgroundImage: e.target.value })}
                                className="
                                    w-full px-3 py-2.5 text-xs 
                                    bg-surface-50 border border-surface-200 rounded-xl
                                    text-surface-700 placeholder:text-surface-400 font-mono
                                    focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                                    hover:border-surface-300
                                    transition-all duration-200
                                "
                                placeholder="https://example.com/image.jpg"
                            />
                            
                            {layout.backgroundImage && (
                                <div className="grid grid-cols-2 gap-2 animate-fade-in">
                                    <select
                                        value={layout.backgroundSize || 'cover'}
                                        onChange={(e) => onUpdatePageLayout({ backgroundSize: e.target.value })}
                                        className="
                                            px-3 py-2 text-xs 
                                            bg-white border border-surface-200 rounded-xl
                                            text-surface-700
                                            focus:outline-none focus:border-brand-500
                                            hover:border-surface-300
                                            transition-all duration-200 cursor-pointer
                                        "
                                    >
                                        <option value="cover">Cover</option>
                                        <option value="contain">Contain</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                    <select
                                        value={layout.backgroundRepeat || 'no-repeat'}
                                        onChange={(e) => onUpdatePageLayout({ backgroundRepeat: e.target.value })}
                                        className="
                                            px-3 py-2 text-xs 
                                            bg-white border border-surface-200 rounded-xl
                                            text-surface-700
                                            focus:outline-none focus:border-brand-500
                                            hover:border-surface-300
                                            transition-all duration-200 cursor-pointer
                                        "
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
                </AnimatedSection>

                {/* Padding Section */}
                <AnimatedSection title="Canvas Padding" icon={Grid3X3} defaultOpen={true} delay={200}>
                    <div className="space-y-4">
                        {/* Quick Presets */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                                Quick Presets
                            </label>
                            <div className="flex gap-1 p-1 bg-surface-100 rounded-xl">
                                {paddingPresets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => applyPaddingPreset(preset.value)}
                                        className="
                                            flex-1 py-2 px-1 text-[11px] font-medium rounded-lg
                                            transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]
                                            cursor-pointer active:scale-95
                                            hover:bg-white hover:shadow-sm
                                            focus:outline-none focus:ring-2 focus:ring-brand-500/30
                                        "
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Individual Controls */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                                Custom Values
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-surface-100 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-surface-500">T</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={layout.padding?.top || 0}
                                        onChange={(e) => onUpdatePageLayout({ 
                                            padding: { ...(layout.padding || {}), top: Number(e.target.value) } 
                                        })}
                                        className="
                                            w-full pl-10 pr-8 py-2.5 text-sm text-right
                                            bg-white border border-surface-200 rounded-xl
                                            text-surface-900
                                            focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                                            hover:border-surface-300
                                            transition-all duration-200
                                        "
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-400">px</span>
                                </div>

                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-surface-100 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-surface-500">B</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={layout.padding?.bottom || 0}
                                        onChange={(e) => onUpdatePageLayout({ 
                                            padding: { ...(layout.padding || {}), bottom: Number(e.target.value) } 
                                        })}
                                        className="
                                            w-full pl-10 pr-8 py-2.5 text-sm text-right
                                            bg-white border border-surface-200 rounded-xl
                                            text-surface-900
                                            focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                                            hover:border-surface-300
                                            transition-all duration-200
                                        "
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-400">px</span>
                                </div>

                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-surface-100 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-surface-500">L</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={layout.padding?.left || 0}
                                        onChange={(e) => onUpdatePageLayout({ 
                                            padding: { ...(layout.padding || {}), left: Number(e.target.value) } 
                                        })}
                                        className="
                                            w-full pl-10 pr-8 py-2.5 text-sm text-right
                                            bg-white border border-surface-200 rounded-xl
                                            text-surface-900
                                            focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                                            hover:border-surface-300
                                            transition-all duration-200
                                        "
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-400">px</span>
                                </div>

                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-surface-100 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-surface-500">R</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={layout.padding?.right || 0}
                                        onChange={(e) => onUpdatePageLayout({ 
                                            padding: { ...(layout.padding || {}), right: Number(e.target.value) } 
                                        })}
                                        className="
                                            w-full pl-10 pr-8 py-2.5 text-sm text-right
                                            bg-white border border-surface-200 rounded-xl
                                            text-surface-900
                                            focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                                            hover:border-surface-300
                                            transition-all duration-200
                                        "
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-400">px</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>

                {/* Global Settings Section */}
                <AnimatedSection title="Global Styles" icon={Type} defaultOpen={true} delay={250}>
                    <div className="space-y-4">
                        {/* Font Family */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                                Base Font Family
                            </label>
                            <div className="relative">
                                <select
                                    value={professionalOptions.fontFamily}
                                    onChange={(e) => onUpdateProfessionalOptions({ fontFamily: e.target.value })}
                                    className="
                                        w-full px-3 py-2.5 pr-10 text-sm
                                        bg-white border border-surface-200 rounded-xl
                                        text-surface-900 appearance-none
                                        focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10
                                        hover:border-surface-300
                                        transition-all duration-200 cursor-pointer
                                    "
                                >
                                    {fontOptions.map((font) => (
                                        <option key={font.value} value={font.value}>
                                            {font.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Base Color */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                                Base Text Color
                            </label>
                            <div className="flex items-center gap-3">
                                <button
                                    className="
                                        w-10 h-10 rounded-xl shadow-md border-2 border-white 
                                        ring-1 ring-surface-200 overflow-hidden
                                        transition-all duration-200 hover:scale-105
                                        cursor-pointer
                                    "
                                    style={{ backgroundColor: professionalOptions.baseColor || '#000000' }}
                                    onClick={() => document.getElementById('text-color-picker')?.click()}
                                >
                                    <input
                                        id="text-color-picker"
                                        type="color"
                                        value={professionalOptions.baseColor || '#000000'}
                                        onChange={(e) => onUpdateProfessionalOptions({ baseColor: e.target.value })}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </button>
                                <div className="flex-1">
                                    <div className="
                                        flex items-center border border-surface-200 rounded-xl 
                                        bg-white px-3 py-2
                                        focus-within:ring-4 focus-within:ring-brand-500/10 focus-within:border-brand-500
                                    ">
                                        <span className="text-surface-400 text-sm font-mono select-none mr-1">#</span>
                                        <input
                                            type="text"
                                            value={(professionalOptions.baseColor || '').replace('#', '')}
                                            onChange={(e) => onUpdateProfessionalOptions({ baseColor: `#${e.target.value}` })}
                                            className="w-full text-sm font-mono text-surface-900 focus:outline-none uppercase"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </AnimatedSection>
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(156, 163, 175, 0.25);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(156, 163, 175, 0.4);
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(156, 163, 175, 0.25) transparent;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    )
}