import React, { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { EditPencilIcon, EditCheckIcon, EditXIcon } from '@/components/shared/Icons';
import { formatCellData } from '@/lib/formatters';

/**
 * A reusable table cell that implements "click-to-edit" for currency.
 *
 * @param {object} props
 * @param {string} props.currentValue - The "real" value from the parent state (e.g., "USD").
 * @param {function} props.onConfirm - (newValue) => void. Callback when "check" is clicked.
 * @param {boolean} props.canEdit - Whether editing is allowed at all.
 */
export function EditableCurrencyCell({ 
    currentValue, 
    onConfirm, 
    canEdit
}) {
    const [isEditing, setIsEditing] = useState(false);
    // Default to 'USD' if no value is provided
    const [editedValue, setEditedValue] = useState(currentValue || 'USD');

    // Sync external changes unless actively editing
    useEffect(() => {
        if (!isEditing) {
            setEditedValue(currentValue || 'USD');
        }
    }, [currentValue, isEditing]);

    const handleConfirm = () => {
        onConfirm(editedValue); // Pass the selected string ("PEN" or "USD")
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedValue(currentValue || 'USD');
        setIsEditing(false);
    };
    
    const handleStartEditing = () => {
        setEditedValue(currentValue || 'USD'); // Ensure edit starts with the correct value
        setIsEditing(true);
    };

    // Render logic
    if (!canEdit) {
        return <>{formatCellData(currentValue)}</>;
    }

    if (isEditing) {
        // --- Editing View ---
        return (
            <div className="flex items-center justify-center space-x-1">
                <div className="w-20">
                    <Select value={editedValue} onValueChange={setEditedValue}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PEN">PEN</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <button 
                    onClick={handleConfirm} 
                    className="p-1 rounded hover:bg-gray-200 text-green-600" 
                    aria-label="Confirm"
                >
                    <EditCheckIcon />
                </button>
                <button 
                    onClick={handleCancel} 
                    className="p-1 rounded hover:bg-gray-200 text-red-600" 
                    aria-label="Cancel"
                >
                    <EditXIcon />
                </button>
            </div>
        );
    }

    // --- Display View ---
    return (
        <div 
            className="group relative flex items-center justify-center cursor-pointer min-h-[32px]" // min-h matches input height
            onClick={handleStartEditing}
        >
            <span>{formatCellData(currentValue)}</span>
            <button
                className="absolute right-0 p-1 rounded bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                aria-label="Edit value"
            >
                <EditPencilIcon />
            </button>
        </div>
    );
}