// src/hooks/useTransactionDashboard.ts
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { getSalesTransactions, calculatePreview as salesCalculatePreview, FormattedSalesTransaction } from '@/features/sales/salesService';
import { getFinanceTransactions, calculatePreview as financeCalculatePreview, FormattedFinanceTransaction } from '@/features/finance/financeService';
import type { 
    User, 
    TransactionDetailResponse, 
    KpiCalculationResponse,
    FixedCost,
    RecurringService 
} from '@/types';
// Import RefObject explicitly for better typing
import type { RefObject } from 'react'; 

// --- Type Definitions for the Hook ---

type DashboardTransaction = FormattedSalesTransaction | FormattedFinanceTransaction;
type DashboardStats = { [key: string]: string | number };
type DashboardView = 'SALES' | 'FINANCE';
type LiveEditState = Record<string, any> | null;

// Define inputs that are common to both dashboards
interface DashboardOptions {
    user: User;
    view: DashboardView;
    onLogout: () => void;
}

// FIX 1: Update DashboardReturn to correctly type Fixed Cost handlers
interface DashboardReturn {
    // Data & Pagination
    transactions: DashboardTransaction[];
    stats: DashboardStats;
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    fetchTransactions: () => Promise<void>;

    // Filtering
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    isDatePickerOpen: boolean;
    setIsDatePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedDate: Date | null;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
    // Ref type is now fixed to be RefObject<HTMLDivElement>
    datePickerRef: RefObject<HTMLDivElement>; 
    handleClearDate: () => void;
    handleSelectToday: () => void;
    filteredTransactions: DashboardTransaction[];

    // Preview/Editing State (Shared across both views)
    apiError: string | null;
    setApiError: React.Dispatch<React.SetStateAction<string | null>>;
    liveKpis: KpiCalculationResponse['data'] | null;
    liveEdits: LiveEditState;
    setLiveKpis: React.Dispatch<React.SetStateAction<KpiCalculationResponse['data'] | null>>;
    editedFixedCosts: FixedCost[] | null;
    setEditedFixedCosts: React.Dispatch<React.SetStateAction<FixedCost[] | null>>;
    editedRecurringServices: RecurringService[] | null;
    setEditedRecurringServices: React.Dispatch<React.SetStateAction<RecurringService[] | null>>;
    isCodeManagerOpen: boolean;
    setIsCodeManagerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    
    // Core Logic Handlers
    handleRecalculate: (inputKey: string, inputValue: any, baseTransaction?: TransactionDetailResponse['data']) => Promise<void>;
    // FIX: Add baseTransaction to the signature
    handleFixedCostAdd: (newCosts: FixedCost[], baseTransaction: TransactionDetailResponse['data'] | undefined) => void;
    // FIX: Add baseTransaction to the signature
    handleFixedCostRemove: (codeToRemove: string, baseTransaction: TransactionDetailResponse['data'] | undefined) => void;
}

// --- Hook Implementation ---

export function useTransactionDashboard({ user, view, onLogout }: DashboardOptions): DashboardReturn {
    // --- State Initialization ---
    const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
    const [filter, setFilter] = useState<string>('');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const datePickerRef = useRef<HTMLDivElement>(null); 
    const [apiError, setApiError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    // Preview/Editing States
    const [liveKpis, setLiveKpis] = useState<KpiCalculationResponse['data'] | null>(null);
    const [liveEdits, setLiveEdits] = useState<LiveEditState>(null);
    const [editedFixedCosts, setEditedFixedCosts] = useState<FixedCost[] | null>(null);
    const [editedRecurringServices, setEditedRecurringServices] = useState<RecurringService[] | null>(null);
    const [isCodeManagerOpen, setIsCodeManagerOpen] = useState<boolean>(false); 

    // --- Core Logic: Fetching Transactions (Unchanged) ---
    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        setApiError(null);
        
        let result;
        if (view === 'SALES') {
            result = await getSalesTransactions(currentPage);
        } else {
            result = await getFinanceTransactions(currentPage);
        }

        if (result.success) {
            setTransactions(result.data || []); 
            setTotalPages(result.pages || 1);
        } else {
            if (view === 'FINANCE' && (result as any).status === 401) {
                onLogout(); 
                return;
            }
            setApiError(result.error || 'Unknown error');
        }
        setIsLoading(false);
    }, [currentPage, view, onLogout]);

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, fetchTransactions]);

    // --- Core Logic: Recalculation (Unified Handler) ---
    const handleRecalculate = useCallback(async (
        inputKey: string, 
        inputValue: any, 
        baseTransaction: TransactionDetailResponse['data'] | undefined
    ) => {
        const payloadSource = baseTransaction;
        if (!payloadSource) return;
        setApiError(null);

        if (inputKey !== 'fixed_costs' && inputKey !== 'recurring_services') {
            setLiveEdits(prev => ({ ...prev, [inputKey]: inputValue }));
        }

        const calculator = view === 'SALES' ? salesCalculatePreview : financeCalculatePreview;
        const currentEdits: LiveEditState = { ...liveEdits, [inputKey]: inputValue }; 
        const baseTx = payloadSource.transactions;

        const costsForPayload = inputKey === 'fixed_costs' ? inputValue as FixedCost[] : editedFixedCosts; 
        const servicesForPayload = inputKey === 'recurring_services' ? inputValue as RecurringService[] : editedRecurringServices;
        
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
            ...payloadSource,     
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
    }, [editedFixedCosts, editedRecurringServices, liveEdits, view, onLogout]);

    // --- Core Logic: Fixed Cost Management (UPDATED TO RECEIVE BASE TRANSACTION) ---

    // FIX: Updated signature to receive baseTransaction
    const handleFixedCostRemove = useCallback((codeToRemove: string, baseTransaction: TransactionDetailResponse['data'] | undefined) => {
        if (!editedFixedCosts) return;
        const combinedCosts = editedFixedCosts.filter(
            cost => cost.ticket !== codeToRemove
        );
        setEditedFixedCosts(combinedCosts);
        // FIX: Pass baseTransaction to handleRecalculate
        handleRecalculate('fixed_costs', combinedCosts, baseTransaction);
    }, [editedFixedCosts, handleRecalculate]);

    // FIX: Updated signature to receive baseTransaction
    const handleFixedCostAdd = useCallback((newCosts: FixedCost[], baseTransaction: TransactionDetailResponse['data'] | undefined) => {
        if (!editedFixedCosts) return;
        const combinedCosts = [...editedFixedCosts, ...newCosts];
        setEditedFixedCosts(combinedCosts);
        // FIX: Pass baseTransaction to handleRecalculate
        handleRecalculate('fixed_costs', combinedCosts, baseTransaction);
    }, [editedFixedCosts, handleRecalculate]);


    // --- Memoized Values (Shared) ---

    const handleClearDate = useCallback(() => { setSelectedDate(null); setIsDatePickerOpen(false); }, []);
    const handleSelectToday = useCallback(() => { setSelectedDate(new Date()); setIsDatePickerOpen(false); }, []);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const filterLower = filter.toLowerCase();
            
            const isFinanceTx = (t as FormattedFinanceTransaction).unidadNegocio !== undefined;
            
            let clientMatch = false;

            if (isFinanceTx) {
                const financeTx = t as FormattedFinanceTransaction;
                clientMatch = financeTx.clientName.toLowerCase().includes(filterLower);
            } else {
                const salesTx = t as FormattedSalesTransaction;
                clientMatch = salesTx.client.toLowerCase().includes(filterLower);
            }
            
            if (!selectedDate) return clientMatch;
            
            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);
    
    // --- Return Hook State and Handlers ---
    return {
        transactions,
        stats: {} as DashboardStats,
        isLoading,
        currentPage,
        totalPages,
        setCurrentPage,
        fetchTransactions,

        filter,
        setFilter,
        isDatePickerOpen,
        setIsDatePickerOpen,
        selectedDate,
        setSelectedDate,
        datePickerRef: datePickerRef as RefObject<HTMLDivElement>, 
        handleClearDate,
        handleSelectToday,
        filteredTransactions,

        apiError,
        setApiError,
        liveKpis,
        setLiveKpis,
        liveEdits,
        editedFixedCosts,
        setEditedFixedCosts,
        editedRecurringServices,
        setEditedRecurringServices,
        isCodeManagerOpen,
        setIsCodeManagerOpen,
        
        handleRecalculate,
        handleFixedCostAdd, // Now expects two arguments
        handleFixedCostRemove, // Now expects two arguments
    };
}