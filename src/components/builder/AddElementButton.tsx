import React, { useState } from 'react';
import { EmailElement } from './DragDropBuilder';

interface AddElementButtonProps {
    onAddElement: (element: EmailElement) => void;
    position?: 'top' | 'bottom' | 'inline';
    showOnHover?: boolean; // Only show on hover
    parentSelected?: boolean; // Show when parent is selected
}

export default function AddElementButton({ onAddElement, position = 'inline', showOnHover = true, parentSelected = false }: AddElementButtonProps) {
    const [showMenu, setShowMenu] = useState(false);

    const createElement = (type: EmailElement['type']): EmailElement => {
        const baseId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        switch (type) {
            case 'heading':
                return {
                    id: baseId,
                    type: 'heading',
                    content: 'New Heading',
                    level: 1,
                    styles: {
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1e293b',
                        margin: '16px 0',
                    }
                };
            case 'paragraph':
                return {
                    id: baseId,
                    type: 'paragraph',
                    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
                    styles: {
                        fontSize: '16px',
                        color: '#1e293b',
                        margin: '12px 0',
                        lineHeight: '1.6',
                    }
                };
            case 'list':
                return {
                    id: baseId,
                    type: 'list',
                    items: ['Item 1', 'Item 2', 'Item 3'],
                    styles: {
                        margin: '12px 0',
                        padding: '0 0 0 20px',
                    }
                };
            case 'button':
                return {
                    id: baseId,
                    type: 'button',
                    content: 'Click Me',
                    styles: {
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        textAlign: 'center',
                        fontSize: '16px',
                        fontWeight: '600',
                        margin: '16px 0',
                        display: 'inline-block',
                    }
                };
            case 'image':
                return {
                    id: baseId,
                    type: 'image',
                    content: 'https://via.placeholder.com/600x300',
                    styles: {
                        width: '100%',
                        margin: '16px 0',
                        borderRadius: '8px',
                    }
                };
            case 'divider':
                return {
                    id: baseId,
                    type: 'divider',
                    styles: {
                        height: '1px',
                        backgroundColor: '#e2e8f0',
                        margin: '24px 0',
                        border: 'none',
                    }
                };
            case 'spacer':
                return {
                    id: baseId,
                    type: 'spacer',
                    styles: {
                        height: '32px',
                        margin: '0',
                    }
                };
            case 'columns':
                return {
                    id: baseId,
                    type: 'columns',
                    columns: [
                        [{ id: `${baseId}-col1-1`, type: 'paragraph', content: 'Column 1 content' }],
                        [{ id: `${baseId}-col2-1`, type: 'paragraph', content: 'Column 2 content' }]
                    ],
                    styles: {
                        margin: '16px 0',
                    },
                    columnGap: '16px',
                    columnAlign: 'stretch',
                };
            default:
                return {
                    id: baseId,
                    type: 'paragraph',
                    content: 'New element',
                };
        }
    };

    const elementTypes: { type: EmailElement['type']; label: string; icon: string }[] = [
        { type: 'heading', label: 'Heading', icon: '📝' },
        { type: 'paragraph', label: 'Paragraph', icon: '📄' },
        { type: 'button', label: 'Button', icon: '🔘' },
        { type: 'image', label: 'Image', icon: '🖼️' },
        { type: 'list', label: 'List', icon: '📋' },
        { type: 'columns', label: 'Columns', icon: '📊' },
        { type: 'divider', label: 'Divider', icon: '➖' },
        { type: 'spacer', label: 'Spacer', icon: '↕️' },
    ];

    const handleAdd = (type: EmailElement['type']) => {
        const element = createElement(type);
        onAddElement(element);
        setShowMenu(false);
    };

    const buttonClass = position === 'top'
        ? 'absolute -top-4 left-1/2 transform -translate-x-1/2'
        : position === 'bottom'
        ? 'absolute -bottom-4 left-1/2 transform -translate-x-1/2'
        : 'mx-auto my-2';

    const shouldShow = !showOnHover || parentSelected;

    return (
        <div className={`relative ${buttonClass} ${shouldShow ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center justify-center w-8 h-8 bg-brand-700 text-white rounded-full hover:bg-brand-800 transition-colors shadow-lg z-10"
                title="Add element"
            >
                <span className="text-lg">+</span>
            </button>

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-20"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-surface-200 z-30 min-w-[200px]">
                        <div className="p-2">
                            <div className="text-xs font-semibold text-surface-500 uppercase px-2 py-1 mb-1">
                                Add Element
                            </div>
                            {elementTypes.map(({ type, label, icon }) => (
                                <button
                                    key={type}
                                    onClick={() => handleAdd(type)}
                                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-surface-700 hover:bg-brand-50 rounded-md transition-colors"
                                >
                                    <span>{icon}</span>
                                    <span>{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

