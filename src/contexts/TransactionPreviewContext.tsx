// src/contexts/TransactionPreviewContext.tsx
import React, {
    createContext,
    useContext,
    useReducer,
    useMemo,
    useEffect,
} from 'react';
import { calculatePreview } from '@/features/transactions/services/shared.service';
import type { TransactionDetailResponse } from '@/types';
import {
    transactionPreviewReducer,
    getInitialState,
    type PreviewState,
    type PreviewAction,
} from '@/hooks/useTransactionPreviewReducer';

// 1. Define the new, simpler context interface
interface ITransactionPreviewContext {
    view: 'SALES' | 'FINANCE';
    baseTransaction: TransactionDetailResponse['data'];
    canEdit: boolean;
    draftState: PreviewState;
    dispatch: React.Dispatch<PreviewAction>;
}

const TransactionPreviewContext =
    createContext<ITransactionPreviewContext | null>(null);

interface ProviderProps {
    children: React.ReactNode;
    baseTransaction: TransactionDetailResponse['data'];
    view: 'SALES' | 'FINANCE';
}

export function TransactionPreviewProvider({
    children,
    baseTransaction,
    view,
}: ProviderProps) {
    // 2. Use the reducer to manage all draft state
    const [draftState, dispatch] = useReducer(
        transactionPreviewReducer,
        baseTransaction,
        getInitialState
    );

    // CRITICAL FIX: Removed the immediate destructuring here to eliminate the 'unused' error.
    // The values are accessed either below in 'value' or inside the useEffect/useMemo.
    
    // 3. canEdit logic remains the same
    const canEdit = useMemo(
        () => baseTransaction.transactions.ApprovalStatus === 'PENDING',
        [baseTransaction]
    );

    // 4. This useEffect now handles ALL recalculations automatically (WITH DEBOUNCING)
    useEffect(() => {
        // MODIFIED: Destructure values *inside* the effect using the latest draftState
        const { liveEdits, currentFixedCosts, currentRecurringServices } = draftState;

        // Do not run on initial render or if data is missing
        if (!baseTransaction) return;

        // --- MODIFICATION: Set up a 500ms timer ---
        const handler = setTimeout(() => {
            // Define the async function *inside* the timer callback
            const recalculate = async () => {
                dispatch({ type: 'RECALCULATION_START' });

                const baseTx = baseTransaction.transactions;

                // Build the payload from base data + current draft state
                const payloadUpdates = {
                    unidadNegocio: liveEdits?.unidadNegocio ?? baseTx.unidadNegocio,
                    plazoContrato: liveEdits?.plazoContrato ?? baseTx.plazoContrato,
                    MRC: liveEdits?.MRC ?? baseTx.MRC,
                    NRC: liveEdits?.NRC ?? baseTx.NRC,
                    mrc_currency: liveEdits?.mrc_currency ?? baseTx.mrc_currency,
                    nrc_currency: liveEdits?.nrc_currency ?? baseTx.nrc_currency,
                    gigalan_region: liveEdits?.gigalan_region ?? baseTx.gigalan_region,
                    gigalan_sale_type: liveEdits?.gigalan_sale_type ?? baseTx.gigalan_sale_type,
                    gigalan_old_mrc: liveEdits?.gigalan_old_mrc ?? baseTx.gigalan_old_mrc,
                };

                const recalculationPayload = {
                    ...baseTransaction,
                    fixed_costs: currentFixedCosts,
                    recurring_services: currentRecurringServices,
                    transactions: {
                        ...baseTx,
                        ...payloadUpdates,
                    },
                };
                delete (recalculationPayload as any).timeline;

                try {
                    const result = await calculatePreview(recalculationPayload);
                    if (result.success) {
                        dispatch({
                            type: 'RECALCULATION_SUCCESS',
                            payload: result.data || null,
                        });
                    } else {
                        dispatch({
                            type: 'RECALCULATION_ERROR',
                            payload: result.error || 'Failed to update KPIs.',
                        });
                    }
                } catch (error: any) {
                    dispatch({
                        type: 'RECALCULATION_ERROR',
                        payload: 'Network error calculating preview.',
                    });
                }
            };

            // Call the async function
            recalculate();
        }, 500); // <-- Wait 500ms after the last dependency change

        // --- MODIFICATION: Cleanup function ---
        // CRITICAL FIX: The dependency is now only the top-level draftState
        return () => {
            clearTimeout(handler);
        };
    }, [
        draftState, // <--- CRITICAL FIX: Ensure the recalculation runs on any valid state update
        baseTransaction,
        dispatch,
    ]);

    // 6. The value provided by the context is now much simpler
    const value = {
        view,
        baseTransaction,
        canEdit,
        draftState,
        dispatch,
    };

    return (
        <TransactionPreviewContext.Provider value={value}>
            {children}
        </TransactionPreviewContext.Provider>
    );
}

// 7. The consumer hook remains the same
export const useTransactionPreview = (): ITransactionPreviewContext => {
    const context = useContext(TransactionPreviewContext);
    if (!context) {
        throw new Error(
            'useTransactionPreview must be used within a TransactionPreviewProvider'
        );
    }
    return context;
};