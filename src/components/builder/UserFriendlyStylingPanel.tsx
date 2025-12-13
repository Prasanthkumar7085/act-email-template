import React from 'react';
import { EmailElement } from './DragDropBuilder';
import ImageUpload from './ImageUpload';

interface UserFriendlyStylingPanelProps {
    element: EmailElement;
    onUpdate: (updates: Partial<EmailElement>) => void;
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
}

// Helper to parse pixel values
const parsePx = (value: string | undefined): number => {
    if (!value) return 0;
    const match = value.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
};

// Helper to format pixel values
const formatPx = (value: number): string => `${value}px`;

// Default color palettes
const defaultTextColors = [
    '#000000', '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#ffffff'
];

const defaultBgColors = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'
];

const normalizeBackgroundImage = (value: string) => {
    if (!value) return '';
    return value.startsWith('url(') ? value : `url(${value})`;
};

export default function UserFriendlyStylingPanel({
    element,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
    canMoveUp = false,
    canMoveDown = false
}: UserFriendlyStylingPanelProps) {
    const updateStyle = (key: string, value: string | number) => {
        const stringValue = typeof value === 'number' ? formatPx(value) : value;
        onUpdate({
            styles: {
                ...element.styles,
                [key]: stringValue,
            },
        });
    };

    const updateContent = (content: string) => {
        onUpdate({ content });
    };

    const updateLevel = (level: number) => {
        onUpdate({ level });
    };

    const updateListItems = (items: string[]) => {
        onUpdate({ items });
    };

    const updateListStyle = (style: 'unordered' | 'ordered' | 'nested') => {
        onUpdate({ listStyle: style });
    };

    const updateImageStyle = (style: 'default' | 'rounded' | 'circle' | 'avatar') => {
        onUpdate({ imageStyle: style });
        // Apply appropriate styles based on image style
        if (style === 'circle' || style === 'avatar') {
            updateStyle('borderRadius', '50%');
            updateStyle('width', '100px');
            updateStyle('height', '100px');
            updateStyle('objectFit', 'cover');
        } else if (style === 'rounded') {
            updateStyle('borderRadius', '8px');
        } else {
            updateStyle('borderRadius', '0');
        }
    };

    const updateBorderFoundation = (partial: { color?: string; width?: string; style?: string }) => {
        onUpdate({
            styles: {
                ...element.styles,
                borderColor: partial.color ?? element.styles?.borderColor,
                borderWidth: partial.width ?? element.styles?.borderWidth,
                borderStyle: partial.style ?? element.styles?.borderStyle,
            },
        });
    };

    const applyAllBorders = () => {
        const color = element.styles?.borderColor || '#e2e8f0';
        const width = element.styles?.borderWidth || '1px';
        const style = element.styles?.borderStyle || 'solid';
        const value = `${width} ${style} ${color}`;
        onUpdate({
            styles: {
                ...element.styles,
                border: value,
                borderTop: value,
                borderRight: value,
                borderBottom: value,
                borderLeft: value,
                borderColor: color,
                borderWidth: width,
                borderStyle: style,
            },
        });
    };

    const clearAllBorders = () => {
        onUpdate({
            styles: {
                ...element.styles,
                border: 'none',
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                borderLeft: 'none',
            },
        });
    };

    const toggleSideBorder = (side: 'Top' | 'Right' | 'Bottom' | 'Left') => {
        const color = element.styles?.borderColor || '#e2e8f0';
        const width = element.styles?.borderWidth || '1px';
        const style = element.styles?.borderStyle || 'solid';
        const key = `border${side}` as const;
        const current = (element.styles as any)?.[key];
        const value = `${width} ${style} ${color}`;
        updateStyle(key, current && current !== 'none' ? 'none' : value);
    };

    // Font size presets
    const fontSizePresets = [
        { label: 'XS', value: '12px' },
        { label: 'SM', value: '14px' },
        { label: 'MD', value: '16px' },
        { label: 'LG', value: '18px' },
        { label: 'XL', value: '20px' },
        { label: '2XL', value: '24px' },
        { label: '3XL', value: '30px' },
        { label: '4XL', value: '36px' },
    ];

    // Padding presets
    const paddingPresets = [
        { label: 'None', value: '0' },
        { label: 'Small', value: '8px' },
        { label: 'Medium', value: '16px' },
        { label: 'Large', value: '24px' },
        { label: 'XL', value: '32px' },
    ];

    // Margin presets
    const marginPresets = [
        { label: 'None', value: '0' },
        { label: 'Small', value: '8px 0' },
        { label: 'Medium', value: '16px 0' },
        { label: 'Large', value: '24px 0' },
        { label: 'XL', value: '32px 0' },
    ];

    // Border radius presets
    const borderRadiusPresets = [
        { label: 'None', value: '0' },
        { label: 'Small', value: '4px' },
        { label: 'Medium', value: '8px' },
        { label: 'Large', value: '12px' },
        { label: 'Full', value: '999px' },
    ];

    return (
        <div className="p-4 space-y-6">
            {/* Content Section */}
            {(element.type === 'heading' || element.type === 'paragraph' || element.type === 'button') && (
                <div className="border-b pb-4 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Content</label>
                        <textarea
                            value={element.content || ''}
                            onChange={(e) => updateContent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={element.type === 'heading' ? 2 : 4}
                            placeholder="Enter your text here..."
                        />
                    </div>

                    {/* Link URL for buttons */}
                    {element.type === 'button' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Link URL <span className="text-xs text-gray-500">(opens in new window)</span>
                            </label>
                            <input
                                type="url"
                                value={element.url || ''}
                                onChange={(e) => onUpdate({ url: e.target.value, linkTarget: '_blank' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com"
                            />
                            <p className="mt-1 text-xs text-gray-500">Leave empty to disable link</p>
                        </div>
                    )}

                    {/* Link URL for headings and paragraphs */}
                    {(element.type === 'heading' || element.type === 'paragraph') && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Link URL <span className="text-xs text-gray-500">(optional)</span>
                            </label>
                            <input
                                type="url"
                                value={element.linkUrl || ''}
                                onChange={(e) => onUpdate({ linkUrl: e.target.value, linkTarget: element.linkTarget || '_self' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com"
                            />
                            <div className="mt-2 flex items-center space-x-4">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        checked={(element.linkTarget || '_self') === '_self'}
                                        onChange={() => onUpdate({ linkTarget: '_self' })}
                                        className="text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">Same window</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        checked={element.linkTarget === '_blank'}
                                        onChange={() => onUpdate({ linkTarget: '_blank' })}
                                        className="text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">New window</span>
                                </label>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Leave empty to disable link</p>
                        </div>
                    )}
                </div>
            )}

            {element.type === 'heading' && (
                <div className="border-b pb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Heading Type</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((level) => (
                            <button
                                key={level}
                                onClick={() => updateLevel(level)}
                                className={`px-3 py-2 rounded-lg font-medium transition-colors ${(element.level || 1) === level
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                H{level}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {element.type === 'list' && (
                <>
                    <div className="border-b pb-4">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">List Style</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => updateListStyle('unordered')}
                                className={`px-3 py-2 rounded-lg font-medium transition-colors ${(element.listStyle || 'unordered') === 'unordered'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                • Bullets
                            </button>
                            <button
                                onClick={() => updateListStyle('ordered')}
                                className={`px-3 py-2 rounded-lg font-medium transition-colors ${element.listStyle === 'ordered'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                1. Numbers
                            </button>
                            <button
                                onClick={() => updateListStyle('nested')}
                                className={`px-3 py-2 rounded-lg font-medium transition-colors ${element.listStyle === 'nested'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                ↳ Nested
                            </button>
                        </div>
                    </div>
                    <div className="border-b pb-4">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">List Items</label>
                        <textarea
                            value={(element.items || []).join('\n')}
                            onChange={(e) => updateListItems(e.target.value.split('\n').filter(item => item.trim()))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={5}
                            placeholder="Enter items, one per line"
                        />
                    </div>
                </>
            )}

            {element.type === 'image' && (
                <div className="border-b pb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Image</label>
                    <ImageUpload
                        onImageSelect={updateContent}
                        currentUrl={element.content}
                    />
                    <div className="mt-4">
                        <label className="block text-xs text-gray-600 mb-2">Image Style</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'default', label: 'Default' },
                                { value: 'rounded', label: 'Rounded' },
                                { value: 'circle', label: 'Circle' },
                                { value: 'avatar', label: 'Avatar' }
                            ].map((style) => (
                                <button
                                    key={style.value}
                                    onClick={() => updateImageStyle(style.value as any)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${(element.imageStyle || 'default') === style.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {style.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mt-4 space-y-3">
                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Width</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['100%', '75%', '50%', 'auto'].map((width) => (
                                    <button
                                        key={width}
                                        onClick={() => updateStyle('width', width)}
                                        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${element.styles?.width === width
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {width}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={element.styles?.width || ''}
                                    onChange={(e) => updateStyle('width', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Custom width (e.g., 300px, 50%)"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Height</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['auto', '200px', '300px', '400px'].map((height) => (
                                    <button
                                        key={height}
                                        onClick={() => updateStyle('height', height)}
                                        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${element.styles?.height === height
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {height}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2">
                                <input
                                    type="range"
                                    min="50"
                                    max="800"
                                    value={parsePx(element.styles?.height) || 300}
                                    onChange={(e) => updateStyle('height', parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="text-xs text-gray-500 text-center mt-1">
                                    {parsePx(element.styles?.height) || 300}px
                                </div>
                                <input
                                    type="text"
                                    value={element.styles?.height || ''}
                                    onChange={(e) => updateStyle('height', e.target.value)}
                                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Custom height (e.g., 250px, auto)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Typography */}
            {(element.type === 'heading' || element.type === 'paragraph' || element.type === 'button' || element.type === 'list') && (
                <div className="border-b pb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Typography</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Font Size</label>
                            <div className="grid grid-cols-4 gap-2">
                                {fontSizePresets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => updateStyle('fontSize', preset.value)}
                                        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${element.styles?.fontSize === preset.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2">
                                <input
                                    type="range"
                                    min="10"
                                    max="48"
                                    value={parsePx(element.styles?.fontSize) || 16}
                                    onChange={(e) => updateStyle('fontSize', parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="text-xs text-gray-500 text-center mt-1">
                                    {parsePx(element.styles?.fontSize) || 16}px
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Font Weight</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['Normal', 'Medium', 'Bold'].map((weight) => {
                                    const value = weight === 'Normal' ? '400' : weight === 'Medium' ? '500' : '700';
                                    return (
                                        <button
                                            key={weight}
                                            onClick={() => updateStyle('fontWeight', value)}
                                            className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${element.styles?.fontWeight === value
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {weight}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Text Alignment</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['left', 'center', 'right', 'justify'].map((align) => (
                                    <button
                                        key={align}
                                        onClick={() => updateStyle('textAlign', align)}
                                        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors capitalize ${element.styles?.textAlign === align
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Colors - Available for ALL elements */}
            <div className="border-b pb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Colors</h4>
                <div className="space-y-3">
                    {/* Text Color - for text elements */}
                    {(element.type === 'heading' || element.type === 'paragraph' || element.type === 'button' || element.type === 'list') && (
                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Text Color</label>
                            <div className="flex items-center space-x-2 mb-2">
                                <input
                                    type="color"
                                    value={element.styles?.color || '#000000'}
                                    onChange={(e) => updateStyle('color', e.target.value)}
                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={element.styles?.color || ''}
                                    onChange={(e) => updateStyle('color', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="#000000"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-1">
                                {defaultTextColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => updateStyle('color', color)}
                                        className="h-8 rounded border-2 border-gray-300 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: color }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Background Color - for ALL elements */}
                    <div>
                        <label className="block text-xs text-gray-600 mb-2">Background Color</label>
                        <div className="flex items-center space-x-2 mb-2">
                            <input
                                type="color"
                                value={element.styles?.backgroundColor || '#ffffff'}
                                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={element.styles?.backgroundColor || ''}
                                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="#ffffff"
                            />
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                            {defaultBgColors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => updateStyle('backgroundColor', color)}
                                    className="h-8 rounded border-2 border-gray-300 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    title={color}
                                />
                            ))}
                        </div>
                        <div className="mt-3 space-y-2">
                            <label className="block text-xs text-gray-600 mb-1">Background Image (URL)</label>
                            <input
                                type="text"
                                value={(element.styles?.backgroundImage || '').replace(/^url\(["']?(.*)["']?\)$/, '$1')}
                                onChange={(e) => updateStyle('backgroundImage', normalizeBackgroundImage(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="https://example.com/image.png"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] text-gray-600">Background Size</label>
                                    <select
                                        value={element.styles?.backgroundSize || 'cover'}
                                        onChange={(e) => updateStyle('backgroundSize', e.target.value)}
                                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    >
                                        <option value="cover">Cover</option>
                                        <option value="contain">Contain</option>
                                        <option value="auto">Auto</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] text-gray-600">Background Repeat</label>
                                    <select
                                        value={element.styles?.backgroundRepeat || 'no-repeat'}
                                        onChange={(e) => updateStyle('backgroundRepeat', e.target.value)}
                                        className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                                    >
                                        <option value="no-repeat">No Repeat</option>
                                        <option value="repeat">Repeat</option>
                                        <option value="repeat-x">Repeat X</option>
                                        <option value="repeat-y">Repeat Y</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spacing */}
            <div className="border-b pb-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Spacing</h4>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-2">Padding</label>
                        <div className="grid grid-cols-5 gap-2">
                            {paddingPresets.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => updateStyle('padding', preset.value)}
                                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${element.styles?.padding === preset.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-2">Margin</label>
                        <div className="grid grid-cols-5 gap-2">
                            {marginPresets.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => updateStyle('margin', preset.value)}
                                    className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${element.styles?.margin === preset.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Column-Specific Properties */}
            {element.type === 'columns' && (
                <div className="border-b pb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Column Layout</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Column Gap</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['0px', '8px', '16px', '24px'].map((gap) => (
                                    <button
                                        key={gap}
                                        onClick={() => onUpdate({ columnGap: gap })}
                                        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${element.columnGap === gap
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {gap}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={element.columnGap || '16px'}
                                onChange={(e) => onUpdate({ columnGap: e.target.value })}
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Custom gap (e.g., 20px)"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Column Alignment</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { value: 'stretch', label: 'Stretch' },
                                    { value: 'start', label: 'Start' },
                                    { value: 'center', label: 'Center' },
                                    { value: 'end', label: 'End' }
                                ].map((align) => (
                                    <button
                                        key={align.value}
                                        onClick={() => onUpdate({ columnAlign: align.value as any })}
                                        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${(element.columnAlign || 'stretch') === align.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {align.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Column Colors</label>
                            <div className="space-y-2">
                                {element.columns?.map((_, colIdx) => (
                                    <div key={colIdx} className="flex items-center space-x-2">
                                        <span className="text-xs w-16">Column {colIdx + 1}:</span>
                                        <input
                                            type="color"
                                            value={element.columnColors?.[colIdx] || '#ffffff'}
                                            onChange={(e) => {
                                                const newColors = [...(element.columnColors || [])];
                                                newColors[colIdx] = e.target.value;
                                                while (newColors.length < (element.columns?.length || 0)) {
                                                    newColors.push('#ffffff');
                                                }
                                                onUpdate({ columnColors: newColors });
                                            }}
                                            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={element.columnColors?.[colIdx] || ''}
                                            onChange={(e) => {
                                                const newColors = [...(element.columnColors || [])];
                                                newColors[colIdx] = e.target.value;
                                                while (newColors.length < (element.columns?.length || 0)) {
                                                    newColors.push('#ffffff');
                                                }
                                                onUpdate({ columnColors: newColors });
                                            }}
                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs"
                                            placeholder="#ffffff"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Column Padding</label>
                            <div className="space-y-2">
                                {element.columns?.map((_, colIdx) => (
                                    <div key={colIdx} className="flex items-center space-x-2">
                                        <span className="text-xs w-16">Column {colIdx + 1}:</span>
                                        <div className="grid grid-cols-4 gap-1 flex-1">
                                            {['0px', '8px', '16px', '24px'].map((pad) => (
                                                <button
                                                    key={pad}
                                                    onClick={() => {
                                                        const newPadding = [...(element.columnPadding || [])];
                                                        newPadding[colIdx] = pad;
                                                        while (newPadding.length < (element.columns?.length || 0)) {
                                                            newPadding.push('8px');
                                                        }
                                                        onUpdate({ columnPadding: newPadding });
                                                    }}
                                                    className={`px-1 py-1 rounded text-xs font-medium transition-colors ${(element.columnPadding?.[colIdx] || '8px') === pad
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {pad}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Border & Shape */}
            {(element.type === 'div' || element.type === 'button' || element.type === 'image' || element.type === 'columns' || element.type === 'paragraph' || element.type === 'heading') && (
                <div className="border-b pb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Border & Shape</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-600 mb-2">Corner Radius</label>
                            <div className="grid grid-cols-5 gap-2">
                                {borderRadiusPresets.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => updateStyle('borderRadius', preset.value)}
                                        className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${element.styles?.borderRadius === preset.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-gray-600">Border Color</label>
                                <input
                                    type="color"
                                    value={element.styles?.borderColor || '#e2e8f0'}
                                    onChange={(e) => updateBorderFoundation({ color: e.target.value })}
                                    className="h-10 w-full border rounded"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-gray-600">Border Width</label>
                                <input
                                    type="text"
                                    value={element.styles?.borderWidth || '1px'}
                                    onChange={(e) => updateBorderFoundation({ width: e.target.value })}
                                    className="px-2 py-1.5 border rounded text-sm"
                                    placeholder="1px"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-gray-600">Border Style</label>
                                <select
                                    value={element.styles?.borderStyle || 'solid'}
                                    onChange={(e) => updateBorderFoundation({ style: e.target.value })}
                                    className="px-2 py-1.5 border rounded text-sm"
                                >
                                    <option value="solid">Solid</option>
                                    <option value="dashed">Dashed</option>
                                    <option value="dotted">Dotted</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={applyAllBorders}
                                className="px-3 py-1.5 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                Show borders
                            </button>
                            <button
                                onClick={clearAllBorders}
                                className="px-3 py-1.5 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            >
                                Hide all
                            </button>
                            {(['Top', 'Right', 'Bottom', 'Left'] as const).map((side) => (
                                <button
                                    key={side}
                                    onClick={() => toggleSideBorder(side)}
                                    className="px-2.5 py-1.5 rounded text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    Toggle {side}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Size (for spacer and image) */}
            {(element.type === 'spacer' || element.type === 'image' || element.type === 'divider') && (
                <div className="border-b pb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Size</h4>
                    <div className="space-y-3">
                        {element.type === 'spacer' && (
                            <div>
                                <label className="block text-xs text-gray-600 mb-2">Height</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={parsePx(element.styles?.height) || 32}
                                    onChange={(e) => updateStyle('height', parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="text-xs text-gray-500 text-center mt-1">
                                    {parsePx(element.styles?.height) || 32}px
                                </div>
                            </div>
                        )}
                        {element.type === 'image' && (
                            <>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-2">Width</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['100%', '75%', '50%'].map((width) => (
                                            <button
                                                key={width}
                                                onClick={() => updateStyle('width', width)}
                                                className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${element.styles?.width === width
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {width}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Button */}
            <div>
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
