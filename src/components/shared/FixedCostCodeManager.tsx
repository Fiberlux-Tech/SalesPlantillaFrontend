// src/components/shared/FixedCostCodeManager.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CloseIcon } from './Icons';
import { getFixedCostsByCodes } from '@/features/sales/salesService'; 
import type { FixedCost } from '@/types';
import type { ReactNode } from 'react';

// Define the shape of the component's state and props
interface FixedCostCodeManagerProps {
    loadedCodes: string[]; 
    onFixedCostAdd: (newCosts: FixedCost[]) => void;
    onToggle: () => void; 
    canRemoveLoadedCodes: boolean; 
}

export function FixedCostCodeManager({ loadedCodes, onFixedCostAdd, onToggle, canRemoveLoadedCodes }: FixedCostCodeManagerProps) {
    const [newCodeInput, setNewCodeInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [stagedCodes, setStagedCodes] = useState<string[]>([]);
    
    const allCodes = useMemo(() => {
        return [...loadedCodes, ...stagedCodes];
    }, [loadedCodes, stagedCodes]);

    const handleAddCode = () => {
        const code = newCodeInput.trim().toUpperCase();
        if (!code) {
             setError("Por favor, ingresa un código.");
             return;
        }

        if (allCodes.includes(code)) {
            setError(`Code ${code} is already loaded or pending.`);
            return;
        }

        setStagedCodes(prev => [...prev, code]);
        setNewCodeInput('');
        setError(null);
    };

    const handleRemoveCode = (codeToRemove: string) => {
        setStagedCodes(prev => prev.filter(code => code !== codeToRemove));
    };

    const handleConfirmCodes = useCallback(async () => {
        if (stagedCodes.length === 0) {
            onToggle();
            return;
        }

        setIsLoading(true);
        setError(null);

        const result = await getFixedCostsByCodes(stagedCodes);

        if (result.success) {
            onFixedCostAdd(result.data); 
            setStagedCodes([]);
            onToggle();
        } else {
            setError(result.error || 'Failed to load codes.');
        }
        setIsLoading(false);
    }, [stagedCodes, onFixedCostAdd, onToggle]);


    return (
        <div className="absolute right-0 w-80 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-20 p-4">
            <h4 className="text-md font-semibold mb-3">Código de Inversión</h4>
            
            {/* Input and "Ir" Button (Grouped) */}
            <div className="flex space-x-2 items-center">
                <div className="flex-grow">
                    <Input
                        type="text"
                        placeholder="E.G., WIN-001"
                        value={newCodeInput}
                        onChange={(e) => { 
                            setNewCodeInput(e.target.value); 
                            setError(null); // Clear error on change
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCode()}
                        className="h-10 text-base"
                        disabled={isLoading}
                    />
                    {/* Error message placement (Tightly below input, matching image_06c8fb.png) */}
                    {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
                </div>
                
                {/* Primary Blue Button */}
                <Button 
                    onClick={handleAddCode} 
                    size="default" // Use default size for better height
                    className="w-16 h-10 bg-blue-600 hover:bg-blue-700 text-white" // Use explicit blue for primary action
                    disabled={isLoading}
                >
                    Ir
                </Button>
            </div>
            
            {/* Horizontal Rule */}
            <hr className="my-4 border-gray-200" />
            
            {/* Codes Loaded */}
            {(loadedCodes.length > 0 || stagedCodes.length > 0) && (
                <div className="pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Códigos Cargados:</p>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                        
                        {/* Codes already loaded from Excel or previous step. Not removable. */}
                        {loadedCodes.map(code => (
                            <div 
                                key={`loaded-${code}`} 
                                className="inline-flex items-center text-sm font-medium bg-gray-100 text-gray-800 px-4 py-2 rounded justify-between"
                            >
                                {code}
                                {/* Non-functional close icon to match aesthetic */}
                                <CloseIcon className="w-4 h-4 text-gray-400" />
                            </div>
                        ))}
                        
                        {/* New staged codes, removable */}
                        {stagedCodes.map(code => (
                            <div 
                                key={`staged-${code}`} 
                                className="inline-flex items-center text-sm font-medium bg-white text-gray-800 px-4 py-2 rounded border border-gray-300 justify-between"
                            >
                                {code}
                                <button
                                    onClick={() => handleRemoveCode(code)}
                                    className="ml-1.5 text-gray-600 hover:text-gray-900"
                                    disabled={isLoading}
                                >
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="flex justify-between border-t pt-4 mt-4">
                <Button 
                    variant="outline" 
                    onClick={onToggle} 
                    size="sm"
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={handleConfirmCodes} 
                    size="sm"
                    disabled={isLoading || stagedCodes.length === 0}
                >
                    {isLoading ? 'Loading...' : 'Confirmar Códigos'}
                </Button>
            </div>
        </div>
    );
}

// Export the EmptyState component for use in the table wrapper
export const FixedCostEmptyState = ({ onToggle }: { onToggle: () => void }) => (
    <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-gray-500 mb-1">No hay datos de inversión cargados.</p>
        <p className="text-sm text-gray-400 mb-4">Use el botón 'Cargar' para agregar datos por código.</p>
        <Button 
            onClick={onToggle}
            variant="outline" 
            size="sm"
        >
            Cargar
        </Button>
    </div>
);