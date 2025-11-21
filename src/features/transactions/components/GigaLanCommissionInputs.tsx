// src/features/sales/components/GigaLanCommissionInputs.tsx
import type { ChangeEvent } from 'react'; // FIX: Import type explicitly
import { Input } from "@/components/ui/input";
import { SALE_TYPES, PLACEHOLDERS, UI_LABELS } from '@/config';

// 1. Define the shape of the 'inputs' prop
interface GigalanInputs {
    gigalan_sale_type: "NUEVO" | "EXISTENTE" | string; // Allow string for flexibility
    gigalan_old_mrc?: number | null;
    [key: string]: any; // Allow other keys from spread operator
}

// 2. Define the main props interface
interface GigaLanCommissionInputsProps {
    inputs: GigalanInputs;
    onInputChange: (key: string, value: number | null) => void;
}

export function GigaLanCommissionInputs({ inputs, onInputChange }: GigaLanCommissionInputsProps) {
    if (inputs.gigalan_sale_type !== SALE_TYPES.EXISTENTE) {
        return null;
    }

    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 uppercase mb-1">{UI_LABELS.MRC_PREVIO}</label>
            <Input
                type="number"
                placeholder={PLACEHOLDERS.ENTER_AMOUNT}
                value={inputs.gigalan_old_mrc ?? ""}
                // 3. Type the event handler with validation
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = parseFloat(e.target.value);
                    // Validate: must be a number and non-negative
                    if (isNaN(value) || value < 0) {
                        onInputChange('gigalan_old_mrc', null);
                    } else {
                        onInputChange('gigalan_old_mrc', value);
                    }
                }}
                className="text-sm"
                min="0"
            />
        </div>
    );
}