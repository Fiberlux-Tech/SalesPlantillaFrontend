// src/features/sales/components/GigaLanCommissionInputs.tsx
import type { ChangeEvent } from 'react'; // FIX: Import type explicitly
import { Input } from "@/components/ui/input";

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
    if (inputs.gigalan_sale_type !== 'EXISTENTE') {
        return null;
    }

    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 uppercase mb-1">MRC PREVIO</label>
            <Input
                type="number"
                placeholder="Enter amount"
                value={inputs.gigalan_old_mrc ?? ""}
                // 3. Type the event handler
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = parseFloat(e.target.value);
                    onInputChange('gigalan_old_mrc', isNaN(value) ? null : value);
                }}
                className="text-sm"
                min="0"
            />
        </div>
    );
}