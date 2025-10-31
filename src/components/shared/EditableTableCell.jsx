import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { EditPencilIcon, EditCheckIcon, EditXIcon } from '@/components/shared/Icons';
import { formatCellData } from '@/lib/formatters';

/**
 * A reusable table cell that implements the "click-to-edit-with-confirmation" pattern.
 *
 * @param {object} props
 * @param {*} props.currentValue - The "real" value from the parent state.
 * @param {function} props.onConfirm - (newValue) => void. Callback when "check" is clicked.
 * @param {boolean} props.canEdit - Whether editing is allowed at all.
 * @param {string} [props.inputType="number"] - The type for the input field.
 * @param {number} [props.min=0] - The minimum value for the input.
 * @param {number} [props.step=1] - The step value for the input.
 */
export function EditableTableCell({ 
    currentValue, 
    onConfirm, 
    canEdit, 
    inputType = "number",
    min = 0,
    step = 1 
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedValue, setEditedValue] = useState(currentValue);

    // Sync external changes (e.g., liveKpis update) unless actively editing
    useEffect(() => {
        if (!isEditing) {
            setEditedValue(currentValue);
        }
    }, [currentValue, isEditing]);

    const handleConfirm = () => {
        let finalValue = editedValue;
        
        // Parse value if it's a number
        if (inputType === 'number') {
            finalValue = parseInt(editedValue, 10);
            if (isNaN(finalValue)) {
                finalValue = min; // Default to min if invalid
            }
        }
        
        onConfirm(finalValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedValue(currentValue);
        setIsEditing(false);
    };
    
    const handleStartEditing = () => {
        setEditedValue(currentValue); // Ensure edit starts with the correct value
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
                <Input
                    type={inputType}
                    value={editedValue}
                    onChange={(e) => setEditedValue(e.target.value)}
                    className="h-8 w-16 text-center"
                    min={min}
                    step={step}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                />
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