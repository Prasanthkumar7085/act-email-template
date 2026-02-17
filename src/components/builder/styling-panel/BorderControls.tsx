
import { Square, Circle } from 'lucide-react';
import StylingSection from './StylingSection';
import StylingRow from './StylingRow';


interface BorderControlsProps {
    styles: any;
    onUpdate: (key: string, value: string) => void;
}

export default function BorderControls({ styles, onUpdate }: BorderControlsProps) {
    const borderStyle = styles?.borderStyle || 'none';
    const borderWidth = styles?.borderWidth || '0px';
    const borderColor = styles?.borderColor || '#000000';
    const borderRadius = styles?.borderRadius || '0px';

    const updateBorder = (key: string, value: string) => {
        // If enabling border, ensure defaults are set
        if (key === 'borderStyle' && value !== 'none' && !styles?.borderWidth) {
            onUpdate('borderWidth', '1px');
            onUpdate('borderColor', '#e5e7eb');
        }
        onUpdate(key, value);
    };

    return (
        <StylingSection title="Border & Radius" defaultOpen={false}>
            {/* Radius Presets */}
            <StylingRow label="Corner Radius">
                <div className="grid grid-cols-5 gap-1.5">
                    {[
                        { label: 'None', value: '0px', icon: Square },
                        { label: 'S', value: '4px' },
                        { label: 'M', value: '8px' },
                        { label: 'L', value: '16px' },
                        { label: 'Full', value: '9999px', icon: Circle },
                    ].map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => onUpdate('borderRadius', preset.value)}
                            className={`h-8 flex items-center justify-center rounded border transition-all ${borderRadius === preset.value
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-surface-200 bg-white text-surface-500 hover:border-surface-300'
                                }`}
                            title={preset.label}
                        >
                            {preset.icon ? <preset.icon className="w-3.5 h-3.5" /> : <span className="text-[10px] font-medium">{preset.label}</span>}
                        </button>
                    ))}
                </div>
            </StylingRow>

            <div className="h-px bg-surface-100 my-3" />

            <StylingRow label="Border Style">
                <div className="grid grid-cols-3 gap-1.5">
                    {['none', 'solid', 'dashed', 'dotted'].map((style) => (
                        <button
                            key={style}
                            // Use slice to avoid showing 4 items in 3 cols, maybe group differently?
                            // Let's just list simplified ones or scroll?
                            // 4 items: grid-cols-4 better? Or just common ones.
                            onClick={() => updateBorder('borderStyle', style)}
                            className={`py-1.5 text-[10px] capitalize font-medium rounded border transition-all ${borderStyle === style
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-surface-200 bg-white text-surface-500 hover:border-surface-300'
                                }`}
                        >
                            {style}
                        </button>
                    ))}
                </div>
            </StylingRow>

            {borderStyle !== 'none' && (
                <div className="space-y-3 mt-3 animate-in fade-in slide-in-from-top-1">
                    <StylingRow label="Width">
                        <div className="flex items-center gap-2">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={parseInt(borderWidth) || 1}
                                onChange={(e) => updateBorder('borderWidth', `${e.target.value}px`)}
                                className="flex-1 h-1.5 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
                            />
                            <span className="text-xs w-8 text-right font-mono text-surface-500">{borderWidth}</span>
                        </div>
                    </StylingRow>

                    <StylingRow label="Color">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded border border-surface-200 shadow-sm"
                                style={{ backgroundColor: borderColor }}
                            />
                            <input
                                type="text"
                                value={borderColor}
                                onChange={(e) => updateBorder('borderColor', e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-surface-200 rounded font-mono uppercase focus:outline-none focus:border-brand-500"
                            />
                            <input
                                type="color"
                                value={borderColor}
                                onChange={(e) => updateBorder('borderColor', e.target.value)}
                                className="w-6 h-6 p-0 border-0 rounded overflow-hidden cursor-pointer"
                            />
                        </div>
                    </StylingRow>
                </div>
            )}
        </StylingSection>
    );
}
