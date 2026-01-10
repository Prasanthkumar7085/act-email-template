import React from 'react';
import { EmailElement } from './DragDropBuilder';
import StylingSection from './styling-panel/StylingSection';
import StylingRow from './styling-panel/StylingRow';
import TypographyControls from './styling-panel/TypographyControls';
import ColorControls from './styling-panel/ColorControls';
import SpacingControls from './styling-panel/SpacingControls';
import BorderControls from './styling-panel/BorderControls';
import ImageControls from './styling-panel/ImageControls';
import { ArrowUp, ArrowDown, MousePointer2, Layout } from 'lucide-react';

interface UserFriendlyStylingPanelProps {
    element: EmailElement;
    onUpdate: (updates: Partial<EmailElement>) => void;
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
}

export default function UserFriendlyStylingPanel({
    element,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
    canMoveUp = false,
    canMoveDown = false
}: UserFriendlyStylingPanelProps) {

    // Helper to update specific styles
    const updateStyle = (key: string, value: string | number) => {
        onUpdate({
            styles: {
                ...element.styles,
                [key]: value,
            },
        });
    };

    // Helper for List Styles
    const updateListStyle = (style: 'unordered' | 'ordered' | 'nested') => {
        onUpdate({ listStyle: style });
    };

    // Helper for List Items
    const updateListItems = (items: string[]) => {
        onUpdate({ items });
    };

    // Helper for Column Layouts
    const updateColumnLayout = (columns: number) => {
        const currentColumns = element.columns || [];
        let newColumns = [...currentColumns];

        if (newColumns.length === 0) {
            newColumns = Array(columns).fill([]);
        } else if (columns > newColumns.length) {
            const columnsToAdd = columns - newColumns.length;
            for (let i = 0; i < columnsToAdd; i++) {
                newColumns.push([]);
            }
        } else if (columns < newColumns.length) {
            newColumns = newColumns.slice(0, columns);
        }

        onUpdate({ columns: newColumns });
    };

    const hasText = ['heading', 'paragraph', 'button', 'list'].includes(element.type);
    const isImage = element.type === 'image';
    const isColumns = element.type === 'columns';
    const isButton = element.type === 'button';

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Element Actions Bar */}
            <div className="p-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                    <MousePointer2 className="w-3.5 h-3.5" />
                    {element.type}
                </span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onMoveUp}
                        disabled={!canMoveUp}
                        className="p-1.5 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 hover:bg-white hover:shadow-sm rounded transition-all"
                        title="Move Up"
                    >
                        <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onMoveDown}
                        disabled={!canMoveDown}
                        className="p-1.5 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-500 hover:bg-white hover:shadow-sm rounded transition-all"
                        title="Move Down"
                    >
                        <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button
                        onClick={onDelete}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                        title="Delete Element"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                {/* Content Editor */}
                {(hasText || isButton) && (
                    <StylingSection title="Content" defaultOpen={true}>
                        <StylingRow label="Text Content">
                            <textarea
                                value={element.content || ''}
                                onChange={(e) => onUpdate({ content: e.target.value })}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px]"
                                placeholder="Enter text here..."
                            />
                        </StylingRow>

                        {/* List Items Editor */}
                        {element.type === 'list' && (
                            <>
                                <StylingRow label="List Type">
                                    <div className="flex bg-gray-50 rounded-lg p-1">
                                        {['unordered', 'ordered'].map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => updateListStyle(style as any)}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded capitalize transition-all ${(element.listStyle || 'unordered') === style
                                                        ? 'bg-white text-blue-600 shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-900'
                                                    }`}
                                            >
                                                {style}
                                            </button>
                                        ))}
                                    </div>
                                </StylingRow>
                                <StylingRow label="List Items">
                                    <textarea
                                        value={(element.items || []).join('\n')}
                                        onChange={(e) => updateListItems(e.target.value.split('\n'))}
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[120px]"
                                        placeholder="Item 1&#10;Item 2&#10;Item 3"
                                    />
                                </StylingRow>
                            </>
                        )}

                        {/* Button/Link URL */}
                        {(isButton || ['heading', 'paragraph'].includes(element.type)) && (
                            <StylingRow label="Link URL" description="Where should this link go?">
                                <div className="relative">
                                    <input
                                        type="url"
                                        value={element.url || element.linkUrl || ''}
                                        onChange={(e) => onUpdate({ [isButton ? 'url' : 'linkUrl']: e.target.value })}
                                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="https://"
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={element.linkTarget !== '_blank'}
                                            onChange={() => onUpdate({ linkTarget: '_self' })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        Same Tab
                                    </label>
                                    <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={element.linkTarget === '_blank'}
                                            onChange={() => onUpdate({ linkTarget: '_blank' })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        New Tab
                                    </label>
                                </div>
                            </StylingRow>
                        )}
                    </StylingSection>
                )}

                {/* Heading Specific */}
                {element.type === 'heading' && (
                    <StylingSection title="Heading Settings" defaultOpen={true}>
                        <StylingRow label="Level">
                            <div className="flex bg-gray-50 rounded-lg p-1">
                                {[1, 2, 3, 4, 5, 6].map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => onUpdate({ level })}
                                        className={`flex-1 py-1.5 text-xs font-semibold rounded transition-all ${(element.level || 1) === level
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        H{level}
                                    </button>
                                ))}
                            </div>
                        </StylingRow>
                    </StylingSection>
                )}

                {/* Column Settings */}
                {isColumns && (
                    <StylingSection title="Column Layout" defaultOpen={true}>
                        <StylingRow label="Columns">
                            <div className="flex bg-gray-50 rounded-lg p-1 gap-1">
                                {[1, 2, 3, 4].map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => updateColumnLayout(count)}
                                        className={`flex-1 py-2 text-xs font-medium rounded transition-all flex flex-col items-center gap-1 ${(element.columns?.length || 2) === count
                                                ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Layout className="w-4 h-4" />
                                        {count}
                                    </button>
                                ))}
                            </div>
                        </StylingRow>

                        <StylingRow label="Column Gap">
                            <select
                                value={element.columnGap || '16px'}
                                onChange={(e) => onUpdate({ columnGap: e.target.value })}
                                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-500 bg-white"
                            >
                                <option value="0px">None (0px)</option>
                                <option value="8px">Small (8px)</option>
                                <option value="16px">Medium (16px)</option>
                                <option value="24px">Large (24px)</option>
                                <option value="32px">X-Large (32px)</option>
                            </select>
                        </StylingRow>

                        <StylingRow label="Vertical Align">
                            <div className="flex bg-gray-50 rounded-lg p-1">
                                {[
                                    { value: 'start', label: 'Top' },
                                    { value: 'center', label: 'Middle' },
                                    { value: 'end', label: 'Bottom' },
                                    { value: 'stretch', label: 'Stretch' }
                                ].map((align) => (
                                    <button
                                        key={align.value}
                                        onClick={() => onUpdate({ columnAlign: align.value as any })}
                                        className={`flex-1 py-1.5 text-[10px] font-medium rounded transition-all ${(element.columnAlign || 'stretch') === align.value
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-900'
                                            }`}
                                    >
                                        {align.label}
                                    </button>
                                ))}
                            </div>
                        </StylingRow>
                    </StylingSection>
                )}

                {/* Typography Controls */}
                {hasText && (
                    <TypographyControls styles={element.styles} onUpdate={updateStyle} />
                )}

                {/* Color Controls */}
                <ColorControls styles={element.styles} onUpdate={updateStyle} elementType={element.type} />

                {/* Image Controls */}
                {isImage && (
                    <ImageControls element={element} onUpdate={onUpdate} />
                )}

                {/* Spacing Controls */}
                <SpacingControls styles={element.styles} onUpdate={updateStyle} />

                {/* Border Controls */}
                <BorderControls styles={element.styles} onUpdate={updateStyle} />

            </div>
        </div>
    );
}
