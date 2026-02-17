import React from 'react';
import { EmailElement } from './DragDropBuilder';

interface ElementStylingPanelProps {
    element: EmailElement;
    onUpdate: (updates: Partial<EmailElement>) => void;
    onDelete: () => void;
}

export default function ElementStylingPanel({ element, onUpdate, onDelete }: ElementStylingPanelProps) {
    const updateStyle = (key: string, value: string) => {
        onUpdate({
            styles: {
                ...element.styles,
                [key]: value,
            },
        });
    };

    const updateContent = (content: string) => {
        onUpdate({ content });
    };

    const updateLevel = (level: number) => {
        if (element.type === 'heading') {
            onUpdate({ level });
        }
    };

    const updateListItems = (items: string[]) => {
        if (element.type === 'list') {
            onUpdate({ items });
        }
    };

    return (
        <div className="p-4 space-y-6">
            {/* Content Section */}
            {(element.type === 'heading' || element.type === 'paragraph' || element.type === 'button') && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                    <textarea
                        value={element.content || ''}
                        onChange={(e) => updateContent(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={element.type === 'heading' ? 2 : 4}
                    />
                </div>
            )}

            {element.type === 'heading' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Heading Level</label>
                    <select
                        value={element.level || 1}
                        onChange={(e) => updateLevel(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <option key={level} value={level}>
                                H{level}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {element.type === 'list' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">List Items</label>
                    <textarea
                        value={(element.items || []).join('\n')}
                        onChange={(e) => updateListItems(e.target.value.split('\n').filter(item => item.trim()))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={5}
                        placeholder="Enter items, one per line"
                    />
                </div>
            )}

            {element.type === 'image' && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                    <input
                        type="text"
                        value={element.content || ''}
                        onChange={(e) => updateContent(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
            )}

            {/* Typography */}
            <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Typography</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Font Size</label>
                        <input
                            type="text"
                            value={element.styles?.fontSize || ''}
                            onChange={(e) => updateStyle('fontSize', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="16px"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Font Weight</label>
                        <select
                            value={element.styles?.fontWeight || ''}
                            onChange={(e) => updateStyle('fontWeight', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">Default</option>
                            <option value="100">Thin (100)</option>
                            <option value="300">Light (300)</option>
                            <option value="400">Normal (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">Semi Bold (600)</option>
                            <option value="700">Bold (700)</option>
                            <option value="800">Extra Bold (800)</option>
                            <option value="900">Black (900)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Font Family</label>
                        <select
                            value={element.styles?.fontFamily || ''}
                            onChange={(e) => updateStyle('fontFamily', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <option value="">Default</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="'Times New Roman', serif">Times New Roman</option>
                            <option value="'Courier New', monospace">Courier New</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Line Height</label>
                        <input
                            type="text"
                            value={element.styles?.lineHeight || ''}
                            onChange={(e) => updateStyle('lineHeight', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="1.6"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Text Align</label>
                        <select
                            value={element.styles?.textAlign || 'left'}
                            onChange={(e) => updateStyle('textAlign', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                            <option value="justify">Justify</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Colors */}
            <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Colors</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Text Color</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={element.styles?.color || '#000000'}
                                onChange={(e) => updateStyle('color', e.target.value)}
                                className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={element.styles?.color || ''}
                                onChange={(e) => updateStyle('color', e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Background Color</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={element.styles?.backgroundColor || '#ffffff'}
                                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                                className="w-12 h-10 border border-slate-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={element.styles?.backgroundColor || ''}
                                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="#ffffff"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacing */}
            <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Spacing</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Padding</label>
                        <input
                            type="text"
                            value={element.styles?.padding || ''}
                            onChange={(e) => updateStyle('padding', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="16px or 10px 20px"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Margin</label>
                        <input
                            type="text"
                            value={element.styles?.margin || ''}
                            onChange={(e) => updateStyle('margin', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="16px 0 or 10px 20px"
                        />
                    </div>
                </div>
            </div>

            {/* Border & Shape */}
            <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Border & Shape</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Border Radius</label>
                        <input
                            type="text"
                            value={element.styles?.borderRadius || ''}
                            onChange={(e) => updateStyle('borderRadius', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="8px"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-600 mb-1">Border</label>
                        <input
                            type="text"
                            value={element.styles?.border || ''}
                            onChange={(e) => updateStyle('border', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="1px solid #e2e8f0"
                        />
                    </div>
                </div>
            </div>

            {/* Size (for spacer and image) */}
            {(element.type === 'spacer' || element.type === 'image' || element.type === 'divider') && (
                <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">Size</h4>
                    <div className="space-y-3">
                        {element.type === 'spacer' && (
                            <div>
                                <label className="block text-xs text-slate-600 mb-1">Height</label>
                                <input
                                    type="text"
                                    value={element.styles?.height || ''}
                                    onChange={(e) => updateStyle('height', e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                    placeholder="32px"
                                />
                            </div>
                        )}
                        {(element.type === 'image' || element.type === 'divider') && (
                            <>
                                <div>
                                    <label className="block text-xs text-slate-600 mb-1">Width</label>
                                    <input
                                        type="text"
                                        value={element.styles?.width || ''}
                                        onChange={(e) => updateStyle('width', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                        placeholder="100%"
                                    />
                                </div>
                                {element.type === 'image' && (
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Height</label>
                                        <input
                                            type="text"
                                            value={element.styles?.height || ''}
                                            onChange={(e) => updateStyle('height', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                            placeholder="auto"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Button */}
            <div className="border-t pt-4">
                <button
                    onClick={onDelete}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
                >
                    🗑️ Delete Element
                </button>
            </div>
        </div>
    );
}

