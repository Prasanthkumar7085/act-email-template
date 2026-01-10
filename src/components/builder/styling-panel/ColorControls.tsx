import { useState, useEffect } from 'react';
import { Type, PaintBucket, Pipette } from 'lucide-react';
import StylingSection from './StylingSection';
import StylingRow from './StylingRow';

interface ColorControlsProps {
    styles: any;
    onUpdate: (key: string, value: string) => void;
    elementType: string;
}

const defaultColors = [
    '#ffffff', '#000000', '#F3F4F6', '#E5E7EB', '#D1D5DB', '#9CA3AF', '#6B7280', '#4B5563', '#374151', '#1F2937', '#111827', // Grays
    '#EF4444', '#F87171', // Red
    '#F59E0B', '#FBBF24', // Amber
    '#10B981', '#34D399', // Emerald
    '#3B82F6', '#60A5FA', // Blue
    '#6366F1', '#818CF8', // Indigo
    '#8B5CF6', '#A78BFA', // Violet
    '#EC4899', '#F472B6', // Pink
];

export default function ColorControls({ styles, onUpdate, elementType }: ColorControlsProps) {
    const [activeTab, setActiveTab] = useState<'text' | 'background'>('text');

    // Determine if text color is applicable
    const hasText = ['heading', 'paragraph', 'button', 'list'].includes(elementType);

    // If element doesn't have text, default to background tab
    useEffect(() => {
        if (!hasText) {
            setActiveTab('background');
        }
    }, [hasText]);


    const handleColorChange = (color: string) => {
        onUpdate(activeTab === 'text' ? 'color' : 'backgroundColor', color);
    };

    const currentColor = activeTab === 'text'
        ? (styles?.color || '#000000')
        : (styles?.backgroundColor || 'transparent');

    return (
        <StylingSection title="Colors" defaultOpen={true}>
            {hasText && (
                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 mb-4">
                    <button
                        onClick={() => setActiveTab('text')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'text'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <Type className="w-3.5 h-3.5" />
                        <span>Text</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('background')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'background'
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }`}
                    >
                        <PaintBucket className="w-3.5 h-3.5" />
                        <span>Background</span>
                    </button>
                </div>
            )}

            <div className="space-y-4">
                {/* Color Input Area */}
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div
                            className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 cursor-pointer overflow-hidden relative ring-1 ring-transparent group-hover:ring-blue-500 transition-all"
                            style={{ backgroundColor: currentColor }}
                        >
                            <input
                                type="color"
                                value={currentColor}
                                onChange={(e) => handleColorChange(e.target.value)}
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
                                value={currentColor.replace('#', '')}
                                onChange={(e) => handleColorChange(`#${e.target.value}`)}
                                className="w-full text-sm font-mono text-gray-700 focus:outline-none uppercase tracking-wide"
                                placeholder="FFFFFF"
                                maxLength={6}
                            />
                        </div>
                    </div>
                </div>

                {/* Presets */}
                <div>
                    <label className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2 block">Presets</label>
                    <div className="grid grid-cols-8 gap-2">
                        {defaultColors.map((color) => (
                            <button
                                key={color}
                                onClick={() => handleColorChange(color)}
                                className={`w-full aspect-square rounded border border-gray-200 hover:scale-110 transition-transform ${currentColor.toLowerCase() === color.toLowerCase()
                                    ? 'ring-2 ring-blue-500 ring-offset-1 border-transparent z-10'
                                    : 'hover:border-gray-300'
                                    }`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                    </div>
                </div>

                {/* Background Image Options only show when Background tab is active */}
                {activeTab === 'background' && (
                    <div className="pt-3 border-t border-gray-100 mt-2">
                        <label className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2 block">Background Image</label>
                        <input
                            type="text"
                            value={(styles?.backgroundImage || '').replace(/^url\(["']?(.*)["']?\)$/, '$1')}
                            onChange={(e) => onUpdate('backgroundImage', e.target.value ? `url(${e.target.value})` : '')}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-gray-300"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                )}
            </div>
        </StylingSection>
    );
}
