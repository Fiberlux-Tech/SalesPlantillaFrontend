// src/contexts/TransactionPreviewContext.tsx
import React, {
    createContext,
    useContext,
    useReducer,
    useMemo,
    useEffect,
    useRef,
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

    // --- 2. ADD THIS REF ---
    // This ref will help us skip the very first run of the effect
    const isInitialRender = useRef(true);
    // --- END OF ADDITION ---

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
        () => ['PENDING', 'BORRADOR'].includes(baseTransaction.transactions.ApprovalStatus),
        [baseTransaction]
    );

    // FIX: Reset state when baseTransaction changes (e.g., after Excel upload)
    useEffect(() => {
        // Skip on initial mount (reducer already initialized)
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }

        // Check if baseTransaction actually has new data
        const hasData = baseTransaction.fixed_costs?.length > 0 || baseTransaction.recurring_services?.length > 0;
        const currentHasData = draftState.currentFixedCosts.length > 0 || draftState.currentRecurringServices.length > 0;

        // Only reset if baseTransaction has data but current state doesn't
        // OR if the data changed significantly
        if (hasData && (!currentHasData ||
            baseTransaction.fixed_costs?.length !== draftState.currentFixedCosts.length ||
            baseTransaction.recurring_services?.length !== draftState.currentRecurringServices.length)) {
            dispatch({ type: 'RESET_STATE', payload: baseTransaction });
        }
    }, [baseTransaction, draftState.currentFixedCosts.length, draftState.currentRecurringServices.length, dispatch]);

    // 4. This useEffect now handles ALL recalculations automatically (WITH DEBOUNCING)
    useEffect(() => {
        // --- 3. ADD THIS BLOCK ---
        // On the very first render, set the ref to false and do nothing.
        // On all subsequent renders (when dependencies change), this will be false.
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        // --- END OF MODIFIED BLOCK ---
        // MODIFIED: Destructure values *from the memoized input object*
        const { liveEdits, currentFixedCosts, currentRecurringServices } = recalculationInputs;

        // Do not run on initial render or if data is missing
        if (!baseTransaction) return;

        // Create AbortController for this request
        const abortController = new AbortController();

        // --- MODIFICATION: Set up a 1500ms timer ---
        const handler = setTimeout(() => {
            // Define the async function *inside* the timer callback
            const recalculate = async () => {

                dispatch({ type: 'RECALCULATION_START' });

                const baseTx = baseTransaction.transactions;

                // Build the payload from base data + current draft state
                const payloadUpdates = {
                    unidadNegocio: liveEdits?.unidadNegocio ?? baseTx.unidadNegocio,
                    plazoContrato: liveEdits?.plazoContrato ?? baseTx.plazoContrato,
                    MRC_original: liveEdits?.MRC_original ?? baseTx.MRC_original,
                    MRC_currency: liveEdits?.MRC_currency ?? baseTx.MRC_currency,
                    NRC_original: liveEdits?.NRC_original ?? baseTx.NRC_original,
                    NRC_currency: liveEdits?.NRC_currency ?? baseTx.NRC_currency,
                    gigalan_region: liveEdits?.gigalan_region ?? baseTx.gigalan_region,
                    gigalan_sale_type: liveEdits?.gigalan_sale_type ?? baseTx.gigalan_sale_type,
                    gigalan_old_mrc: liveEdits?.gigalan_old_mrc ?? baseTx.gigalan_old_mrc,
                    tipoCambio: baseTx.tipoCambio, // <--- ADDED static field
                    costoCapitalAnual: baseTx.costoCapitalAnual, // <--- ADDED static field
                    aplicaCartaFianza: liveEdits?.aplicaCartaFianza ?? baseTx.aplicaCartaFianza,
                    tasaCartaFianza: baseTx.tasaCartaFianza,
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

                    // Check if request was aborted
                    if (abortController.signal.aborted) {
                        return;
                    }

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
                    // Don't dispatch error if request was aborted
                    if (!abortController.signal.aborted) {
                        dispatch({
                            type: 'RECALCULATION_ERROR',
                            payload: 'Network error calculating preview.',
                        });
                    }
                }
            };

            // Call the async function
            recalculate();
        }, 1500); // <-- Wait 1500ms after the last dependency change

        // --- MODIFICATION: Cleanup function ---
        return () => {
            clearTimeout(handler);
            // Abort in-flight request
            abortController.abort();
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