import React, { useState, useEffect } from 'react';
import KpiCard from '@/components/shared/KpiCard';
import { Input } from '@/components/ui/input';
import { EditPencilIcon, EditCheckIcon, EditXIcon } from '@/components/shared/Icons';

// Local utility mirroring the formatter's logic for display
const formatCurrency = (value) => {
    const numValue = parseFloat(value);
    if (typeof numValue !== 'number' || isNaN(numValue) || numValue === 0) return '-';
    // Use Intl.NumberFormat for cleaner currency display
    return numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


/**
 * A reusable component for an editable KPI card.
 * Handles display/edit mode, local input state, and validation for a single numeric KPI.
 * * @param {object} props
 * @param {string} props.title - The title for the KPI (e.g., "MRC").
 * @param {number} props.currentValue - The current value of the KPI (from liveKpis or tx data).
 * @param {boolean} props.canEdit - Whether the field can be edited (e.g., !isFinanceView && isPending).
 * @param {function} props.onValueChange - Callback function when the value is updated and submitted. (Expects (kpiKey, newValue))
 * @param {string} props.kpiKey - The key used to identify the KPI when calling onValueChange (e.g., 'MRC', 'NRC').
 * @param {string} [props.subtext] - Optional subtext for the KPI Card.
 */
export function EditableKpiCard({ title, currentValue, canEdit, onValueChange, kpiKey, subtext }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedValue, setEditedValue] = useState(currentValue ?? '');

    // Sync external changes (e.g., liveKpis update) unless actively editing
    useEffect(() => {
        if (!isEditing) {
            setEditedValue(currentValue ?? '');
        }
    }, [currentValue, isEditing]);

    const handleEditSubmit = () => {
        const newValue = parseFloat(editedValue);
        // Only allow non-negative numbers
        if (!isNaN(newValue) && newValue >= 0) {
            onValueChange(kpiKey, newValue);
            setIsEditing(false);
        } else {
            alert(`Please enter a valid non-negative number for ${title}.`);
        }
    };

    const handleCancelEdit = () => {
        setEditedValue(currentValue ?? '');
        setIsEditing(false);
    };

    const displayValue = formatCurrency(currentValue);

    return (
        <div className="relative group">
            {canEdit && isEditing ? (
                /* --- Editing View (Input + Buttons) --- */
                <div className="bg-white p-3 rounded-lg border border-blue-300 shadow-md h-full flex flex-col justify-center">
                    <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Edit {title}</label>
                    <div className="flex items-center space-x-2 mt-1">
                        <Input
                            type="number"
                            value={editedValue}
                            onChange={(e) => setEditedValue(e.target.value)}
                            className="h-9 flex-grow text-sm p-2 border-input ring-ring focus-visible:ring-1 bg-white"
                            min="0"
                            step="0.01"
                            autoFocus
                        />
                        <button onClick={handleEditSubmit} className="p-1 rounded hover:bg-gray-200 text-green-600 flex-shrink-0" aria-label="Confirm"><EditCheckIcon /></button>
                        <button onClick={handleCancelEdit} className="p-1 rounded hover:bg-gray-200 text-red-600 flex-shrink-0" aria-label="Cancel"><EditXIcon /></button>
                    </div>
                </div>
            ) : (
                /* --- Display View (KpiCard + Hover Edit Button) --- */
                <>
                    <KpiCard
                        title={title}
                        value={displayValue}
                        subtext={subtext}
                    />
                    {canEdit && (
                        <button
                            onClick={() => { setEditedValue(currentValue ?? ''); setIsEditing(true); }}
                            className="absolute top-2 right-2 p-1 rounded bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200"
                            aria-label={`Edit ${title}`}
                        >
                            <EditPencilIcon />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}