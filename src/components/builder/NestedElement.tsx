import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmailElement } from './DragDropBuilder';
import ColumnsElement from './ColumnsElement';
import ElementControls from './ElementControls';

interface NestedElementProps {
    element: EmailElement;
    isSelected: boolean;
    onSelect: (e?: React.MouseEvent) => void;
    onUpdate: (updates: Partial<EmailElement>) => void;
    onDelete: () => void;
    onAddElement: (element: EmailElement) => void;
    parentPath: string;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
}

export default function NestedElement({
    element,
    isSelected,
    onSelect,
    onUpdate,
    onDelete,
    onAddElement,
    parentPath,
    onMoveUp,
    onMoveDown,
    canMoveUp = false,
    canMoveDown = false,
}: NestedElementProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: element.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const renderElement = () => {
        const elementStyle = {
            ...element.styles,
            position: 'relative' as const,
            outline: isSelected ? '2px solid #06b6d4' : 'none',
            outlineOffset: '2px',
        };

        switch (element.type) {
            case 'heading':
                const HeadingTag = `h${element.level || 1}` as keyof JSX.IntrinsicElements;
                return (
                    <HeadingTag style={elementStyle} onClick={(e) => { e.stopPropagation(); onSelect(e); }}>
                        {element.content || 'Heading'}
                    </HeadingTag>
                );
            case 'paragraph':
                return (
                    <p style={elementStyle} onClick={(e) => { e.stopPropagation(); onSelect(e); }}>
                        {element.content || 'Paragraph'}
                    </p>
                );
            case 'list':
                const listStyle = element.listStyle || 'unordered';
                if (listStyle === 'ordered') {
                    return (
                        <ol style={elementStyle} onClick={(e) => { e.stopPropagation(); onSelect(e); }}>
                            {(element.items || []).map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ol>
                    );
                }
                return (
                    <ul style={elementStyle} onClick={(e) => { e.stopPropagation(); onSelect(e); }}>
                        {(element.items || []).map((item, idx) => (
                            <li key={idx}>{item}</li>
                        ))}
                    </ul>
                );
            case 'button':
                return (
                    <div style={{ ...elementStyle, textAlign: element.styles?.textAlign || 'center' }} onClick={(e) => { e.stopPropagation(); onSelect(e); }}>
                        <button
                            style={{
                                backgroundColor: element.styles?.backgroundColor || '#06b6d4',
                                color: element.styles?.color || '#ffffff',
                                padding: element.styles?.padding || '12px 24px',
                                borderRadius: element.styles?.borderRadius || '8px',
                                fontSize: element.styles?.fontSize || '16px',
                                fontWeight: element.styles?.fontWeight || '600',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            {element.content || 'Button'}
                        </button>
                    </div>
                );
            case 'image':
                const imageStyle = element.imageStyle || 'default';
                const imgStyle = {
                    ...elementStyle,
                    ...(imageStyle === 'circle' || imageStyle === 'avatar' ? {
                        borderRadius: '50%',
                        width: element.styles?.width || '100px',
                        height: element.styles?.height || '100px',
                        objectFit: 'cover' as const,
                    } : imageStyle === 'rounded' ? {
                        borderRadius: element.styles?.borderRadius || '8px',
                    } : {}),
                };
                return (
                    <img
                        src={element.content || 'https://via.placeholder.com/600x300'}
                        alt="Email image"
                        style={imgStyle}
                        onClick={(e) => { e.stopPropagation(); onSelect(e); }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x300';
                        }}
                    />
                );
            case 'spacer':
                return <div style={elementStyle} onClick={(e) => { e.stopPropagation(); onSelect(e); }} />;
            case 'divider':
                return <hr style={elementStyle} onClick={(e) => { e.stopPropagation(); onSelect(e); }} />;
            default:
                return (
                    <div style={elementStyle} onClick={(e) => { e.stopPropagation(); onSelect(e); }}>
                        {element.content || element.type}
                    </div>
                );
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group"
            {...attributes}
            {...listeners}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(e);
            }}
        >
            <div className="relative">
                {renderElement()}
                {isSelected && (
                    <ElementControls
                        elementType={element.type}
                        onDelete={onDelete}
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                    />
                )}
            </div>
        </div>
    );
}

