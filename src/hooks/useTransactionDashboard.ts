// src/hooks/useTransactionDashboard.ts
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { getSalesTransactions, FormattedSalesTransaction } from '@/features/sales/salesService';
import { getFinanceTransactions, FormattedFinanceTransaction } from '@/features/finance/financeService';
import type { User } from '@/types';
import type { RefObject } from 'react'; 

// --- Type Definitions for the Hook ---

type DashboardTransaction = FormattedSalesTransaction | FormattedFinanceTransaction;
type DashboardStats = { [key: string]: string | number };
type DashboardView = 'SALES' | 'FINANCE';

// Define inputs that are common to both dashboards
interface DashboardOptions {
    user: User;
    view: DashboardView;
    onLogout: () => void;
}

// FIX 1: The return type is NOW MUCH SMALLER
interface DashboardReturn {
    // Data & Pagination
    transactions: DashboardTransaction[];
    stats: DashboardStats;
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    fetchTransactions: (pageToFetch: number) => Promise<void>; // Modified to accept page

    // Filtering
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    isDatePickerOpen: boolean;
    setIsDatePickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedDate: Date | null;
    setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
    datePickerRef: RefObject<HTMLDivElement>; 
    handleClearDate: () => void;
    handleSelectToday: () => void;
    filteredTransactions: DashboardTransaction[];
    
    // API Error for the *list* page
    apiError: string | null;
    setApiError: React.Dispatch<React.SetStateAction<string | null>>;
}

// --- Hook Implementation ---

export function useTransactionDashboard({ view, onLogout }: DashboardOptions): DashboardReturn {
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
    
    // REMOVED ALL MODAL-RELATED STATE:
    // liveKpis, liveEdits, editedFixedCosts, editedRecurringServices, isCodeManagerOpen

    // --- Core Logic: Fetching Transactions (Modified to take page) ---
    const fetchTransactions = useCallback(async (pageToFetch: number) => {
        setIsLoading(true);
        setApiError(null);
        
        let result;
        if (view === 'SALES') {
            result = await getSalesTransactions(pageToFetch);
        } else {
            result = await getFinanceTransactions(pageToFetch);
        }

        if (result.success) {
            setTransactions(result.data || []); 
            setTotalPages(result.pages || 1);
            setCurrentPage(pageToFetch); // Set current page after successful fetch
        } else {
            if (view === 'FINANCE' && (result as any).status === 401) {
                onLogout(); 
                return;
            }
            setApiError(result.error || 'Unknown error');
        }
        setIsLoading(false);
    }, [view, onLogout]); // Removed currentPage from dependencies

    // Initial fetch
    useEffect(() => {
        fetchTransactions(1); // Fetch page 1 on mount
    }, [fetchTransactions]); // Runs once on mount

    
    // REMOVED ALL HANDLERS FOR MODAL LOGIC:
    // handleRecalculate, handleFixedCostRemove, handleFixedCostAdd


    // --- Memoized Values (Shared) ---
    const handleClearDate = useCallback(() => { setSelectedDate(null); setIsDatePickerOpen(false); }, []);
    const handleSelectToday = useCallback(() => { setSelectedDate(new Date()); setIsDatePickerOpen(false); }, []);

    // Filter logic remains the same
    const filteredTransactions = useMemo(() => {
        // ... (filter logic is unchanged) ...
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
    
    // --- Return Hook State and Handlers (Much smaller) ---
    return {
        transactions,
        stats: {} as DashboardStats,
        isLoading,
        currentPage,
        totalPages,
        setCurrentPage: (pageAction) => {
            // New setCurrentPage logic to trigger fetch
            const newPage = typeof pageAction === 'function' ? pageAction(currentPage) : pageAction;
            if (newPage !== currentPage) {
                fetchTransactions(newPage);
            }
        },
        fetchTransactions: () => fetchTransactions(currentPage), // Add a way to refresh current page

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
    };
}