// src/features/sales/components/SalesPreviewFooter.tsx
import { CheckCircleIcon } from '../../../components/shared/Icons';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext';
import type { TransactionDetailResponse } from '@/types';

// Props interface remains correct
interface SalesPreviewFooterProps {
    onConfirm: (finalData: TransactionDetailResponse['data']) => void;
    onClose: () => void;
}

export function SalesPreviewFooter({ onConfirm, onClose }: SalesPreviewFooterProps) {
    
    // --- GET DATA FROM CONTEXT ---
    const {
        baseTransaction,
        liveEdits,
        currentFixedCosts, // <-- FIX: Use this instead of editedFixedCosts
        currentRecurringServices, // <-- FIX: Use this instead of editedRecurringServices
        apiError,
        setApiError
    } = useTransactionPreview();

    const handleConfirmClick = () => {
        setApiError(null);
        
        // Build the final payload from context state
        const finalPayload = {
            ...baseTransaction,
            fixed_costs: currentFixedCosts, // <-- FIX: Use the non-null variable
            recurring_services: currentRecurringServices, // <-- FIX: Use the non-null variable
            transactions: {
                ...baseTransaction.transactions,
                ...liveEdits,
            }
        };
        
        // Pass the complete, live payload up to the dashboard handler
        onConfirm(finalPayload);
    };
    
    return (
        <div className="flex justify-between items-center p-5 border-t bg-white space-x-3">
            <div className="flex-grow flex items-center text-sm">
                {/* Show error from context if it exists */}
                {apiError ? (
                    <span className="text-red-600 font-medium">{apiError}</span>
                ) : (
                    <>
                        <CheckCircleIcon />
                        <span className="ml-2 text-gray-600">Toda la data es inicialmente extraida del excel</span>
                    </>
                )}
            </div>
            <button 
                onClick={onClose} 
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                Cancelar
            </button>
            <button 
                onClick={handleConfirmClick} // Use the new internal handler
                className="px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
                Confirmar
            </button>
        </div>
    );
}