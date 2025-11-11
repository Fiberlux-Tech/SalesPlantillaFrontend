// src/features/transactions/components/RecurringServiceCodeManager.tsx
import { useState, useCallback, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CloseIcon } from '../../../components/shared/Icons';
// MODIFIED: Import the correct service
import { getRecurringServicesByCodes } from '@/features/transactions/services/shared.service';
// MODIFIED: Import the correct type
import type { RecurringService } from '@/types';

// MODIFIED: Define props for this component
interface RecurringServiceCodeManagerProps {
    loadedCodes: string[]; 
    onRecurringServiceAdd: (newServices: RecurringService[]) => void;
    onToggle: () => void; 
    onCodeRemove: (codeToRemove: string) => void;
}

export function RecurringServiceCodeManager({ loadedCodes, onRecurringServiceAdd, onToggle, onCodeRemove }: RecurringServiceCodeManagerProps) {
    const [newCodeInput, setNewCodeInput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const managerRef = useRef<HTMLDivElement>(null); 
    
    // Click-away logic (unchanged)
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (managerRef.current && !managerRef.current.contains(event.target as Node)) {
                onToggle();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onToggle]);

    const handleAddAndConfirmCode = useCallback(async () => {
        const code = newCodeInput.trim().toUpperCase();
        if (!code) {
             setError("Por favor, ingresa un código.");
             return;
        }

        if (loadedCodes.includes(code)) {
            setError(`Code ${code} is already loaded.`);
            return;
        }
        
        setIsLoading(true);
        setError(null);

        // MODIFIED: Call the recurring service endpoint
        const result = await getRecurringServicesByCodes([code]); 

        if (result.success && result.data.length > 0) {
            // MODIFIED: Call the correct prop
            onRecurringServiceAdd(result.data); 
            setNewCodeInput('');
            onToggle(); 
        } else {
            let errorMessage = `Código no válido.`;
            if (!result.success) {
                errorMessage = result.error || errorMessage;
            }
            setError(errorMessage);
        }
        setIsLoading(false);
    }, [newCodeInput, loadedCodes, onRecurringServiceAdd, onToggle]);


    return (
        <div ref={managerRef} className="absolute right-0 w-80 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-20 p-4" onClick={(e) => e.stopPropagation()}>
            {/* MODIFIED: Title */}
            <h4 className="text-md font-semibold mb-3">Código de Servicio Recurrente</h4>
            
            <div className="flex space-x-2 items-center">
                <div className="flex-grow">
                    <Input
                        type="text"
                        // MODIFIED: Placeholder
                        placeholder="E.G., Q-12345"
                        value={newCodeInput}
                        onChange={(e) => { 
                            setNewCodeInput(e.target.value); 
                            setError(null);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddAndConfirmCode()} 
                        className="h-10 text-base"
                        disabled={isLoading}
                    />
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>} 
                </div>
                
                <Button 
                    onClick={handleAddAndConfirmCode} 
                    size="default" 
                    className="w-16 h-10 bg-blue-600 hover:bg-blue-700 text-white" 
                    disabled={isLoading}
                >
                    Ir
                </Button>
            </div>
            
            <hr className="my-4 border-gray-200" />
            
            {loadedCodes.length > 0 && (
                <div className="pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">Códigos Cargados:</p>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                        {loadedCodes.map(code => (
                            <div 
                                key={`loaded-${code}`} 
                                className="inline-flex items-center text-sm font-medium bg-white text-gray-800 px-3 py-2 rounded border border-gray-300 justify-between"
                            >
                                <span className="font-medium">{code}</span>
                                <button
                                    onClick={() => onCodeRemove(code)}
                                    className="ml-2 text-gray-500 hover:text-red-600 transition-colors"
                                    aria-label={`Remove code ${code}`}
                                >
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// MODIFIED: New empty state component
export const RecurringServiceEmptyState = ({ onToggle }: { onToggle: () => void }) => (
    <div className="flex flex-col items-center justify-center py-6 text-center">
        <p className="text-gray-500 mb-1">No hay servicios recurrentes cargados.</p>
        <p className="text-sm text-gray-400 mb-4">Use el botón 'Cargar' para agregar servicios por código.</p>
    </div>
);