import React from 'react';
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"; 

const REGIONS = ['LIMA', 'PROVINCIAS CON CACHING', 'PROVINCIAS CON INTERNEXA', 'PROVINCIAS CON TDP'];
const SALE_TYPES = ['NUEVO', 'EXISTENTE'];

export function GigaLanCommissionInputs({ inputs, onInputChange }) {
    return (
        // Removed the outer div, title, border, and margin classes.
        // This component now only contains the input grid.
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* REGION Select */}
            <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">REGION</label>
                <Select
                    value={inputs.gigalan_region || ""}
                    onValueChange={(value) => onInputChange('gigalan_region', value)}
                >
                    <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                        {REGIONS.map(region => (
                            <SelectItem key={region} value={region}>
                                {region}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* TYPE OF SALE Select */}
            <div>
                <label className="block text-xs font-medium text-gray-700 uppercase mb-1">TYPE OF SALE</label>
                <Select
                    value={inputs.gigalan_sale_type || ""}
                    onValueChange={(value) => onInputChange('gigalan_sale_type', value)}
                >
                    <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        {SALE_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                                {type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* PREVIOUS MONTHLY CHARGE Input (Conditional) */}
            {inputs.gigalan_sale_type === 'EXISTENTE' && (
                <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase mb-1">PREVIOUS MONTHLY CHARGE</label>
                    <Input
                        type="number"
                        placeholder="Enter amount"
                        value={inputs.gigalan_old_mrc || ""}
                        onChange={(e) => onInputChange('gigalan_old_mrc', parseFloat(e.target.value) || null)}
                        className="text-sm"
                    />
                </div>
            )}
        </div>
    );
}