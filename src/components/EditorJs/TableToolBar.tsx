import type React from "react"

interface TableToolbarProps {
    onAddRow: () => void
    onDeleteRow: () => void
    onAddColumn: () => void
    onDeleteColumn: () => void
}

const TableToolbar: React.FC<TableToolbarProps> = ({ onAddRow, onDeleteRow, onAddColumn, onDeleteColumn }) => {
    return (
        <div className="table-toolbar">
            <button onClick={onAddRow}>Add Row</button>
            <button onClick={onDeleteRow}>Delete Row</button>
            <button onClick={onAddColumn}>Add Column</button>
            <button onClick={onDeleteColumn}>Delete Column</button>
        </div>
    )
}

export default TableToolbar

