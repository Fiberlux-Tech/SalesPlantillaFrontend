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

    // 1. FIX: Memoize the set of inputs that should trigger a recalculation.
    // This object reference only changes when one of its deep dependencies change.
    const recalculationInputs = useMemo(() => ({
        liveEdits: draftState.liveEdits,
        currentFixedCosts: draftState.currentFixedCosts,
        currentRecurringServices: draftState.currentRecurringServices,
    }), [
        draftState.liveEdits,
        draftState.currentFixedCosts,
        draftState.currentRecurringServices,
    ]);
    
    // 3. canEdit logic remains the same
    const canEdit = useMemo(
        () => baseTransaction.transactions.ApprovalStatus === 'PENDING',
        [baseTransaction]
    );

    // 4. This useEffect now handles ALL recalculations automatically (WITH DEBOUNCING)
    useEffect(() => {
        // MODIFIED: Destructure values *from the memoized input object*
        const { liveEdits, currentFixedCosts, currentRecurringServices } = recalculationInputs;
        
        // Do not run on initial render or if data is missing
        if (!baseTransaction) return;

        // --- MODIFICATION: Set up a 500ms timer ---
        const handler = setTimeout(() => {
            // Define the async function *inside* the timer callback
            const recalculate = async () => {
                // Ensure recalculation doesn't run if the state is already empty (e.g. initial run after mount)
                if (Object.keys(liveEdits).length === 0 && currentFixedCosts.length === 0 && currentRecurringServices.length === 0) {
                    // Avoid unnecessary recalculation if initial state is clean
                    return;
                }

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
                    tipoCambio: baseTx.tipoCambio, // <--- ADDED static field
                    costoCapitalAnual: baseTx.costoCapitalAnual, // <--- ADDED static field
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
        return () => {
            clearTimeout(handler);
        };
    }, [
        recalculationInputs, // <--- CRITICAL FIX: Use the memoized input object as dependency
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