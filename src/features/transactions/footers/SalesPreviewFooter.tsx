// src/features/transactions/footers/SalesPreviewFooter.tsx
import { CheckCircleIcon } from '../../../components/shared/Icons';
import { useTransactionPreview } from '@/contexts/TransactionPreviewContext';
import type { TransactionDetailResponse } from '@/types';
import { UNIDADES_NEGOCIO } from '@/lib/constants'; // <-- ADD THIS IMPORT

// --- PROPS INTERFACE (No change) ---
interface SalesPreviewFooterProps {
    onConfirm: (finalData: TransactionDetailResponse['data']) => void;
    onClose: () => void;
}

export function SalesPreviewFooter({ onConfirm, onClose }: SalesPreviewFooterProps) {

    // --- 1. GET DATA FROM CONTEXT (Refactored) ---
    // Get dispatch and draftState
    const {
        baseTransaction,
        draftState,
        dispatch
    } = useTransactionPreview();

    // 2. Destructure all state from draftState
    const {
        liveEdits,
        currentFixedCosts,
        currentRecurringServices,
        apiError // Get apiError from here
    } = draftState;

    const handleConfirmClick = () => {
        // 3. Use dispatch to set the error state
        dispatch({ type: 'SET_API_ERROR', payload: null });

        // Combine base transaction with any live edits to get the final state
        const finalTransactionState = { ...baseTransaction.transactions, ...liveEdits };

        // --- ADD THIS VALIDATION BLOCK ---
        if (!finalTransactionState.unidadNegocio || !UNIDADES_NEGOCIO.includes(finalTransactionState.unidadNegocio)) {
            const errorMsg = "Selección obligatoria: Por favor, selecciona una 'Unidad de Negocio' válida.";
            dispatch({ type: 'SET_API_ERROR', payload: errorMsg });
            alert(errorMsg);
            return; // Stop the submission
        }
        // --- END OF VALIDATION BLOCK ---

        // Build the final payload from context state
        const finalPayload = {
            ...baseTransaction,
            fixed_costs: currentFixedCosts,
            recurring_services: currentRecurringServices,
            transactions: finalTransactionState, // Use the already merged object
        };

        // Pass the complete, live payload up to the dashboard handler
        onConfirm(finalPayload);
    };

    return (
        <div className="w-full flex justify-between items-center p-5 border-t bg-white space-x-3">
            <div className="flex-grow flex items-center text-sm">
                {/* 4. Read error from draftState */}
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
                onClick={handleConfirmClick}
                className="px-5 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
            >
                Confirmar
            </button>
        </div>
    );
}