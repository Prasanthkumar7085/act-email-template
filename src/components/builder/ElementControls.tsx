import React from 'react';

interface ElementControlsProps {
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onDelete?: () => void;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    elementType?: string;
}

export default function ElementControls({
    onMoveUp,
    onMoveDown,
    onDelete,
    canMoveUp = false,
    canMoveDown = false,
    elementType,
}: ElementControlsProps) {
    return (
        <div className="absolute -top-8 left-0 flex items-center space-x-1 bg-brand-700 text-white px-1 py-0.5 rounded text-xs z-20">
            {onMoveUp && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMoveUp();
                    }}
                    disabled={!canMoveUp}
                    className={`px-1.5 py-0.5 rounded hover:bg-brand-800 transition-colors ${
                        canMoveUp ? '' : 'opacity-50 cursor-not-allowed'
                    }`}
                    title="Move Up"
                >
                    ↑
                </button>
            )}
            {onMoveDown && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onMoveDown();
                    }}
                    disabled={!canMoveDown}
                    className={`px-1.5 py-0.5 rounded hover:bg-brand-800 transition-colors ${
                        canMoveDown ? '' : 'opacity-50 cursor-not-allowed'
                    }`}
                    title="Move Down"
                >
                    ↓
                </button>
            )}
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="px-1.5 py-0.5 rounded hover:bg-red-600 transition-colors ml-1"
                    title="Delete"
                >
                    🗑️
                </button>
            )}
            {elementType && (
                <span className="px-1.5 text-xs opacity-75">{elementType}</span>
            )}
        </div>
    );
}

