
import { Maximize2, MoveHorizontal, MoveVertical } from 'lucide-react';
import StylingSection from './StylingSection';

interface SpacingControlsProps {
    styles: any;
    onUpdate: (key: string, value: string) => void;
}

const spacingPresets = [
    { label: '0', value: '0' },
    { label: 'XS', value: '4px' },
    { label: 'S', value: '8px' },
    { label: 'M', value: '16px' },
    { label: 'L', value: '24px' },
    { label: 'XL', value: '32px' },
];

export default function SpacingControls({ styles, onUpdate }: SpacingControlsProps) {
    const renderSpacingInput = (type: 'padding' | 'margin') => {
        const currentValue = styles?.[type];

        return (
            <div className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase font-semibold text-surface-400 tracking-wider flex items-center gap-1.5">
                        {type === 'padding' ? <Maximize2 className="w-3 h-3 text-brand-500" /> : <MoveHorizontal className="w-3 h-3 text-orange-500" />}
                        {type}
                    </label>
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-6 gap-1 mb-2 bg-surface-50 p-1 rounded-lg border border-surface-100">
                    {spacingPresets.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => onUpdate(type, preset.value)}
                            className={`py-1 text-[10px] font-medium rounded transition-all ${currentValue === preset.value
                                ? 'bg-white text-brand-700 shadow-sm ring-1 ring-black/5'
                                : 'text-surface-400 hover:text-surface-900 hover:bg-surface-200/50'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Custom Input */}
                <div className="relative group">
                    <input
                        type="text"
                        value={currentValue || ''}
                        onChange={(e) => onUpdate(type, e.target.value)}
                        className="w-full pl-3 pr-8 py-2 text-xs border border-surface-200 rounded-lg text-surface-700 bg-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 font-medium transition-all group-hover:border-surface-300"
                        placeholder="e.g. 10px 20px"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-surface-400 font-mono pointer-events-none">
                        CSS
                    </div>
                </div>
            </div>
        );
    };

    return (
        <StylingSection title="Spacing" defaultOpen={false}>
            {renderSpacingInput('padding')}
            <div className="h-px bg-gradient-to-r from-transparent via-surface-100 to-transparent my-4" />
            {renderSpacingInput('margin')}
        </StylingSection>
    );
}
