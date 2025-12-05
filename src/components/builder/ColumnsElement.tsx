import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EmailElement } from './DragDropBuilder';
import AddElementButton from './AddElementButton';
import NestedElement from './NestedElement';
import ElementControls from './ElementControls';

interface ColumnsElementProps {
    element: EmailElement;
    isSelected: boolean;
    selectedElementId: string | null;
    onSelect: () => void;
    onUpdate: (updates: Partial<EmailElement>) => void;
    onDelete: () => void;
    onSelectElement: (id: string | null) => void;
    onUpdateElement: (id: string, updates: Partial<EmailElement>) => void;
    onDeleteElement: (id: string) => void;
    onAddElementToColumn: (columnIndex: number, element: EmailElement) => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
}

function ColumnDropZone({
    column,
    columnIndex,
    elementId,
    selectedElementId,
    onSelectElement,
    onUpdateElement,
    onDeleteElement,
    onAddElement,
    columnColor,
    columnPadding,
    onSelectColumns,
    columnsSelected,
    onMoveElementInColumn,
}: {
    column: EmailElement[];
    columnIndex: number;
    elementId: string;
    selectedElementId: string | null;
    onSelectElement: (id: string | null) => void;
    onUpdateElement: (id: string, updates: Partial<EmailElement>) => void;
    onDeleteElement: (id: string) => void;
    onAddElement: (element: EmailElement) => void;
    columnColor?: string;
    columnPadding?: string;
    onSelectColumns?: () => void;
    columnsSelected?: boolean;
    onMoveElementInColumn?: (elementId: string, direction: 'up' | 'down') => void;
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: `column-${elementId}-${columnIndex}`,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                padding: columnPadding || '8px',
                minHeight: '60px',
                backgroundColor: columnColor || (isOver ? '#dbeafe' : 'transparent'),
                ...(isOver && !columnColor ? { border: '2px dashed #3b82f6' } : {}),
            }}
            className="relative column-zone"
            onClick={(e) => {
                // Select columns element when clicking on empty column zone
                const target = e.target as HTMLElement;
                if (target === e.currentTarget ||
                    target.classList.contains('column-zone') ||
                    (target.classList.contains('space-y-2') && column.length === 0)) {
                    e.stopPropagation();
                    onSelectColumns?.();
                }
            }}
        >
            {column.length > 0 ? (
                <SortableContext items={column.map(el => el.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                        {column.map((colElement, colElIndex) => {
                            const canMoveColElUp = colElIndex > 0;
                            const canMoveColElDown = colElIndex < column.length - 1;

                            return (
                                <NestedElement
                                    key={colElement.id}
                                    element={colElement}
                                    isSelected={selectedElementId === colElement.id}
                                    onSelect={(e) => {
                                        e?.stopPropagation();
                                        onSelectElement(colElement.id);
                                    }}
                                    onUpdate={(updates) => {
                                        const newColumn = column.map(c => c.id === colElement.id ? { ...c, ...updates } : c);
                                        onUpdateElement(colElement.id, { ...colElement, ...updates });
                                    }}
                                    onDelete={() => onDeleteElement(colElement.id)}
                                    onAddElement={onAddElement}
                                    parentPath={`${elementId}.col${columnIndex}`}
                                    onMoveUp={() => {
                                        if (colElIndex > 0 && onMoveElementInColumn) {
                                            onMoveElementInColumn(colElement.id, 'up');
                                        }
                                    }}
                                    onMoveDown={() => {
                                        if (colElIndex < column.length - 1 && onMoveElementInColumn) {
                                            onMoveElementInColumn(colElement.id, 'down');
                                        }
                                    }}
                                    canMoveUp={canMoveColElUp}
                                    canMoveDown={canMoveColElDown}
                                />
                            );
                        })}
                    </div>
                </SortableContext>
            ) : (
                <div className="text-gray-400 text-xs py-4 text-center border-2 border-dashed border-gray-300 rounded">
                    Empty column
                </div>
            )}
            <AddElementButton
                onAddElement={onAddElement}
                position="bottom"
                showOnHover={true}
                parentSelected={columnsSelected || false}
            />
        </div>
    );
}

export default function ColumnsElement({
    element,
    isSelected,
    selectedElementId,
    onSelect,
    onUpdate,
    onDelete,
    onSelectElement,
    onUpdateElement,
    onDeleteElement,
    onAddElementToColumn,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown,
}: ColumnsElementProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: element.id,
    });

    const { setNodeRef: columnsDropRef, isOver: columnsIsOver } = useDroppable({
        id: `columns-${element.id}`,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const elementStyle = {
        ...element.styles,
        position: 'relative' as const,
        outline: isSelected ? '2px solid #06b6d4' : 'none',
        outlineOffset: '2px',
        minHeight: '60px',
    };

    const handleAddColumn = () => {
        const newColumns = [...(element.columns || []), []];
        onUpdate({ columns: newColumns });
    };

    const handleRemoveColumn = () => {
        if (element.columns && element.columns.length > 1) {
            const newColumns = element.columns.slice(0, -1);
            onUpdate({ columns: newColumns });
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group"
        >
            <div className="relative">
                <div
                    ref={columnsDropRef}
                    style={elementStyle}
                    onClick={(e) => {
                        // Select columns element when clicking on the container area
                        const target = e.target as HTMLElement;
                        // Only select if clicking on the columns container itself or empty space
                        if (target === e.currentTarget || target.classList.contains('columns-container')) {
                            e.stopPropagation();
                            onSelect();
                        }
                    }}
                    className={`relative columns-container ${columnsIsOver ? 'bg-blue-50 border-2 border-blue-400 border-dashed' : ''}`}
                >
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${element.columns?.length || 2}, 1fr)`,
                            gap: element.columnGap || '16px',
                            alignItems: element.columnAlign || 'stretch',
                        }}
                        onClick={(e) => {
                            // Select columns when clicking on the grid container
                            if (e.target === e.currentTarget) {
                                e.stopPropagation();
                                onSelect();
                            }
                        }}
                    >
                        {element.columns?.map((column, colIdx) => {
                            const columnColor = element.columnColors?.[colIdx];
                            const columnPadding = element.columnPadding?.[colIdx] || '8px';
                            return (
                                <ColumnDropZone
                                    key={colIdx}
                                    column={column}
                                    columnIndex={colIdx}
                                    elementId={element.id}
                                    selectedElementId={selectedElementId}
                                    onSelectElement={(id) => {
                                        // If clicking on column zone itself, select columns element
                                        if (!id) {
                                            onSelect();
                                        } else {
                                            onSelectElement(id);
                                        }
                                    }}
                                    onUpdateElement={(id, updates) => {
                                        const newColumns = [...(element.columns || [])];
                                        newColumns[colIdx] = newColumns[colIdx].map(c => c.id === id ? { ...c, ...updates } : c);
                                        onUpdate({ columns: newColumns });
                                    }}
                                    onDeleteElement={(id) => {
                                        const newColumns = [...(element.columns || [])];
                                        newColumns[colIdx] = newColumns[colIdx].filter(c => c.id !== id);
                                        onUpdate({ columns: newColumns });
                                    }}
                                    onAddElement={(newEl) => {
                                        const newColumns = [...(element.columns || [])];
                                        newColumns[colIdx] = [...newColumns[colIdx], newEl];
                                        onUpdate({ columns: newColumns });
                                    }}
                                    columnColor={columnColor}
                                    columnPadding={columnPadding}
                                    onSelectColumns={() => onSelect()}
                                    columnsSelected={isSelected}
                                    onMoveElementInColumn={(elementId, direction) => {
                                        const newColumns = [...(element.columns || [])];
                                        const col = newColumns[colIdx];
                                        const elementIndex = col.findIndex(el => el.id === elementId);
                                        if (elementIndex >= 0) {
                                            if (direction === 'up' && elementIndex > 0) {
                                                const temp = col[elementIndex];
                                                col[elementIndex] = col[elementIndex - 1];
                                                col[elementIndex - 1] = temp;
                                                newColumns[colIdx] = [...col];
                                                onUpdate({ columns: newColumns });
                                            } else if (direction === 'down' && elementIndex < col.length - 1) {
                                                const temp = col[elementIndex];
                                                col[elementIndex] = col[elementIndex + 1];
                                                col[elementIndex + 1] = temp;
                                                newColumns[colIdx] = [...col];
                                                onUpdate({ columns: newColumns });
                                            }
                                        }
                                    }}
                                />
                            );
                        })}
                    </div>
                    {isSelected && (
                        <div className="absolute top-2 right-2 flex items-center space-x-2 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddColumn();
                                }}
                                className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                                title="Add column"
                            >
                                + Column
                            </button>
                            {element.columns && element.columns.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveColumn();
                                    }}
                                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                                    title="Remove column"
                                >
                                    - Column
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {isSelected && (
                    <ElementControls
                        onMoveUp={onMoveUp}
                        onMoveDown={onMoveDown}
                        onDelete={onDelete}
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        elementType={element.type}
                    />
                )}
            </div>
            <div
                {...attributes}
                {...listeners}
                className={`
                    absolute -left-8 top-0 bottom-0 w-6 flex items-center justify-center
                    cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity
                    ${isSelected ? 'opacity-100' : ''}
                `}
            >
                <div className="w-1 h-full bg-gray-300 hover:bg-blue-500 rounded-full" />
            </div>
        </div>
    );
}

