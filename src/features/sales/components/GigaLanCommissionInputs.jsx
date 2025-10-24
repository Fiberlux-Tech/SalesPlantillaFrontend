import React from 'react';
import { Input } from "@/components/ui/input";
// REMOVED: Select imports are no longer needed here
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue
// } from "@/components/ui/select";

// REMOVED: Constants are no longer needed here
// const REGIONS = ['LIMA', 'PROVINCIAS CON CACHING', 'PROVINCIAS CON INTERNEXA', 'PROVINCIAS CON TDP'];
// const SALE_TYPES = ['NUEVO', 'EXISTENTE'];

export function GigaLanCommissionInputs({ inputs, onInputChange }) {
    // Only render the "PREVIOUS MONTHLY CHARGE" input if the sale type is 'EXISTENTE'
    // The component itself is only rendered when Unidad is GIGALAN, so we don't need to check that here.
    if (inputs.gigalan_sale_type !== 'EXISTENTE') {
        return null; // Don't render anything if the sale type isn't 'EXISTENTE'
    }

    return (
        // The component now ONLY renders this single input field and its label.
        <div>
            <label className="block text-xs font-medium text-gray-700 uppercase mb-1">PREVIOUS MONTHLY CHARGE</label>
            <Input
                type="number"
                placeholder="Enter amount"
                // Ensure value is handled correctly (empty string if null/undefined)
                value={inputs.gigalan_old_mrc ?? ""}
                onChange={(e) => {
                    // Attempt to parse the float, fallback to null if invalid
                    const value = parseFloat(e.target.value);
                    onInputChange('gigalan_old_mrc', isNaN(value) ? null : value);
                }}
                className="text-sm"
                min="0" // Optional: prevent negative numbers
            />
        </div>
    );
}