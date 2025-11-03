// src/contexts/TransactionPreviewContext.tsx
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { 
    calculatePreview as salesCalculatePreview 
} from '@/features/sales/salesService';
import { 
    calculatePreview as financeCalculatePreview 
} from '@/features/finance/financeService';
import type { 
    TransactionDetailResponse, 
    KpiCalculationResponse, 
    FixedCost, 
    RecurringService 
} from '@/types';

// Define the shape of the data and functions our context will provide
interface ITransactionPreviewContext {
    view: 'SALES' | 'FINANCE';
    baseTransaction: TransactionDetailResponse['data'];
    liveKpis: KpiCalculationResponse['data'] | null;
    apiError: string | null;
    setApiError: (error: string | null) => void;
    
    // Live Edits State
    liveEdits: Record<string, any> | null;
    editedFixedCosts: FixedCost[] | null;
    editedRecurringServices: RecurringService[] | null;
    isCodeManagerOpen: boolean;
    setIsCodeManagerOpen: (isOpen: boolean) => void;

    // Handlers
    handleRecalculate: (key: string, value: any, baseTxData: TransactionDetailResponse['data']) => Promise<void>;
    handleFixedCostAdd: (newCosts: FixedCost[], baseTxData: TransactionDetailResponse['data']) => void;
    handleFixedCostRemove: (codeToRemove: string, baseTxData: TransactionDetailResponse['data']) => void;
    handleFixedCostChange: (index: number, field: keyof FixedCost, value: any, baseTxData: TransactionDetailResponse['data']) => void;
    handleRecurringServiceChange: (index: number, field: keyof RecurringService, value: any, baseTxData: TransactionDetailResponse['data']) => void;
    handleGigalanInputChange: (key: string, value: any, baseTxData: TransactionDetailResponse['data']) => void;
    handleUnidadChange: (value: string, baseTxData: TransactionDetailResponse['data']) => void;

    // Derived State
    canEdit: boolean;
    currentFixedCosts: FixedCost[];
    currentRecurringServices: RecurringService[];
}

// Create the context
const TransactionPreviewContext = createContext<ITransactionPreviewContext | null>(null);

// Create the Provider component
interface ProviderProps {
    children: React.ReactNode;
    baseTransaction: TransactionDetailResponse['data'];
    view: 'SALES' | 'FINANCE';
}

export function TransactionPreviewProvider({ children, baseTransaction, view }: ProviderProps) {
    // All state that was in the dashboards is now managed *here*
    const [liveKpis, setLiveKpis] = useState<KpiCalculationResponse['data'] | null>(null);
    const [liveEdits, setLiveEdits] = useState<Record<string, any> | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    
    const [editedFixedCosts, setEditedFixedCosts] = useState<FixedCost[] | null>(
        () => baseTransaction.fixed_costs || []
    );
    const [editedRecurringServices, setEditedRecurringServices] = useState<RecurringService[] | null>(
        () => baseTransaction.recurring_services || []
    );
    const [isCodeManagerOpen, setIsCodeManagerOpen] = useState<boolean>(false);

    // Derived state
    const canEdit = useMemo(() => baseTransaction.transactions.ApprovalStatus === 'PENDING', [baseTransaction]);
    const currentFixedCosts = useMemo(() => editedFixedCosts || [], [editedFixedCosts]);
    const currentRecurringServices = useMemo(() => editedRecurringServices || [], [editedRecurringServices]);

    // All handler logic is also moved *here*
    const handleRecalculate = useCallback(async (
        inputKey: string, 
        inputValue: any,
        baseTxData: TransactionDetailResponse['data']
    ) => {
        if (!baseTxData) return;
        setApiError(null);

        const calculator = view === 'SALES' ? salesCalculatePreview : financeCalculatePreview;
        
        // Determine current state values for the payload
        const currentEdits: Record<string, any> = { ...liveEdits, [inputKey]: inputValue }; 
        const baseTx = baseTxData.transactions;
        const costsForPayload = inputKey === 'fixed_costs' ? inputValue : editedFixedCosts; 
        const servicesForPayload = inputKey === 'recurring_services' ? inputValue : editedRecurringServices;

        const payloadUpdates = {
             unidadNegocio: currentEdits?.unidadNegocio ?? baseTx.unidadNegocio,
             plazoContrato: currentEdits?.plazoContrato ?? baseTx.plazoContrato,
             MRC: currentEdits?.MRC ?? baseTx.MRC,
             NRC: currentEdits?.NRC ?? baseTx.NRC,
             mrc_currency: currentEdits?.mrc_currency ?? baseTx.mrc_currency,
             nrc_currency: currentEdits?.nrc_currency ?? baseTx.nrc_currency,
             gigalan_region: currentEdits?.gigalan_region ?? baseTx.gigalan_region,
             gigalan_sale_type: currentEdits?.gigalan_sale_type ?? baseTx.gigalan_sale_type,
             gigalan_old_mrc: currentEdits?.gigalan_old_mrc ?? baseTx.gigalan_old_mrc,
        };
        
        const recalculationPayload = {
            ...baseTxData,     
            fixed_costs: costsForPayload,
            recurring_services: servicesForPayload,
            transactions: {
                ...baseTx,
                ...payloadUpdates
            }
        };
        delete (recalculationPayload as any).timeline;

        try {
            const result = await calculator(recalculationPayload);
            if (result.success) {
                setLiveKpis(result.data || null);
            } else {
                setApiError(result.error || 'Failed to update KPIs.');
                setLiveKpis(null);
            }
        } catch (error: any) {
            setApiError('Network error calculating preview.');
            setLiveKpis(null);
        }
    }, [view, liveEdits, editedFixedCosts, editedRecurringServices]);

    const handleFixedCostRemove = useCallback((codeToRemove: string, baseTxData: TransactionDetailResponse['data']) => {
        const newCosts = (editedFixedCosts || []).filter(cost => cost.ticket !== codeToRemove);
        setEditedFixedCosts(newCosts);
        handleRecalculate('fixed_costs', newCosts, baseTxData);
    }, [editedFixedCosts, handleRecalculate]);

    const handleFixedCostAdd = useCallback((newCosts: FixedCost[], baseTxData: TransactionDetailResponse['data']) => {
        const combinedCosts = [...(editedFixedCosts || []), ...newCosts];
        setEditedFixedCosts(combinedCosts);
        handleRecalculate('fixed_costs', combinedCosts, baseTxData);
    }, [editedFixedCosts, handleRecalculate]);
    
    const handleFixedCostChange = useCallback((index: number, field: keyof FixedCost, value: any, baseTxData: TransactionDetailResponse['data']) => {
        const newCosts = [...(editedFixedCosts || [])];
        (newCosts[index] as any)[field] = value;
        setEditedFixedCosts(newCosts);
        handleRecalculate('fixed_costs', newCosts, baseTxData);
    }, [editedFixedCosts, handleRecalculate]);

    const handleRecurringServiceChange = useCallback((index: number, field: keyof RecurringService, value: any, baseTxData: TransactionDetailResponse['data']) => {
        const newServices = [...(editedRecurringServices || [])];
        (newServices[index] as any)[field] = value; 
        setEditedRecurringServices(newServices);
        handleRecalculate('recurring_services', newServices, baseTxData);
    }, [editedRecurringServices, handleRecalculate]);

    const handleGigalanInputChange = useCallback((key: string, value: any, baseTxData: TransactionDetailResponse['data']) => {
        setLiveEdits(prev => ({ ...prev, [key]: value }));
        handleRecalculate(key, value, baseTxData);
    }, [handleRecalculate]);

    const handleUnidadChange = useCallback((value: string, baseTxData: TransactionDetailResponse['data']) => {
        setLiveEdits(prev => ({ ...prev, 'unidadNegocio': value }));
        handleRecalculate('unidadNegocio', value, baseTxData);
    }, [handleRecalculate]);


    // The value provided to all children
    const value = {
        view,
        baseTransaction,
        liveKpis,
        apiError,
        setApiError,
        liveEdits,
        editedFixedCosts,
        editedRecurringServices,
        isCodeManagerOpen,
        setIsCodeManagerOpen,
        handleRecalculate,
        handleFixedCostAdd,
        handleFixedCostRemove,
        handleFixedCostChange,
        handleRecurringServiceChange,
        handleGigalanInputChange,
        handleUnidadChange,
        canEdit,
        currentFixedCosts,
        currentRecurringServices,
    };

    return (
        <TransactionPreviewContext.Provider value={value}>
            {children}
        </TransactionPreviewContext.Provider>
    );
}

// Create the consumer hook
export const useTransactionPreview = (): ITransactionPreviewContext => {
    const context = useContext(TransactionPreviewContext);
    if (!context) {
        throw new Error('useTransactionPreview must be used within a TransactionPreviewProvider');
    }
    return context;
};