
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Type, Minus, Plus } from 'lucide-react';
import StylingSection from './StylingSection';
import StylingRow from './StylingRow';


interface TypographyControlsProps {
    styles: any;
    onUpdate: (key: string, value: string | number) => void;
}

const fontSizePresets = [
    { label: 'XS', value: '12px' },
    { label: 'SM', value: '14px' },
    { label: 'MD', value: '16px' },
    { label: 'LG', value: '18px' },
    { label: 'XL', value: '20px' },
    { label: '2XL', value: '24px' },
    { label: '3XL', value: '30px' },
];

export default function TypographyControls({ styles, onUpdate }: TypographyControlsProps) {
    const currentAlign = styles?.textAlign || 'left';
    const currentWeight = styles?.fontWeight || '400';
    const currentSize = styles?.fontSize || '16px';

    // Helper to parse pixel values safely
    const parsePx = (value: string | undefined): number => {
        if (!value) return 16;
        const match = String(value).match(/(\d+)/);
        return match ? parseInt(match[1]) : 16;
    };

    return (
        <StylingSection title="Typography" defaultOpen={true}>
            {/* Font Size */}
            <StylingRow label="Font Size">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-gray-400" />
                        <div className="flex-1 relative h-6 flex items-center">
                            <input
                                type="range"
                                min="10"
                                max="72"
                                value={parsePx(currentSize)}
                                onChange={(e) => onUpdate('fontSize', `${e.target.value}px`)}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-0"
                            />
                        </div>
                        <div className="w-14 h-7 relative">
                            <div className="absolute inset-0 border border-gray-200 rounded-md bg-white flex items-center px-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
                                <input
                                    type="text"
                                    value={currentSize}
                                    onChange={(e) => onUpdate('fontSize', e.target.value)}
                                    className="w-full h-full text-xs text-right focus:outline-none bg-transparent font-medium text-gray-700"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </StylingRow>

            <div className="space-y-4">
                {/* Text Alignment & Weight Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Align</label>
                        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                            {[
                                { value: 'left', icon: AlignLeft },
                                { value: 'center', icon: AlignCenter },
                                { value: 'right', icon: AlignRight },
                                { value: 'justify', icon: AlignJustify },
                            ].map((align) => (
                                <button
                                    key={align.value}
                                    onClick={() => onUpdate('textAlign', align.value)}
                                    className={`flex-1 py-1.5 flex items-center justify-center rounded-md transition-all ${currentAlign === align.value
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-200/50'
                                        }`}
                                    title={`Align ${align.value}`}
                                >
                                    <align.icon className="w-3.5 h-3.5" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Weight</label>
                        <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                            {[
                                { label: 'R', value: '400', title: 'Regular' },
                                { label: 'M', value: '500', title: 'Medium' },
                                { label: 'B', value: '700', title: 'Bold' },
                            ].map((weight) => (
                                <button
                                    key={weight.value}
                                    onClick={() => onUpdate('fontWeight', weight.value)}
                                    className={`flex-1 py-1.5 text-xs rounded-md transition-all flex items-center justify-center ${currentWeight === weight.value
                                        ? 'bg-white text-blue-600 shadow-sm font-semibold'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 '
                                        } ${weight.value === '700' ? 'font-bold' : weight.value === '500' ? 'font-medium' : 'font-normal'}`}
                                    title={weight.title}
                                >
                                    {weight.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Line Height */}
                <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Line Height</label>
                    <div className="flex bg-gray-50 rounded-lg p-0.5 border border-gray-200">
                        {['1', '1.2', '1.5', '1.8', '2'].map((lh) => (
                            <button
                                key={lh}
                                onClick={() => onUpdate('lineHeight', lh)}
                                className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${styles?.lineHeight === lh
                                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                            >
                                {lh}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </StylingSection>
    );
}
