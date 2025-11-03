// src/features/finance/FinanceDashboard.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { FinanceStatsGrid } from './components/FinanceStatsGrid'; // Assumes migration
import { FinanceToolBar } from './components/FinanceToolBar'; // Assumes migration
import { TransactionList } from './components/TransactionList'; // Assumes migration
import DataPreviewModal from '../../components/shared/DataPreviewModal'; // Assumes migration
import { TransactionPreviewContent } from '../transactions/components/TransactionPreviewContent'; // Assumes migration
import { FinancePreviewFooter } from './components/FinancePreviewFooter'; // Assumes migration
import { 
    getFinanceTransactions, 
    getTransactionDetails, 
    updateTransactionStatus, 
    calculateCommission,
    calculatePreview,
    type FormattedFinanceTransaction // 1. Import the new local type
} from './financeService';
import type { 
    User, 
    TransactionDetailResponse, 
    KpiCalculationResponse, 
    FixedCost, 
    RecurringService 
} from '@/types'; // 2. Import all shared types

// 3. Define component props
interface FinanceDashboardProps {
    user: User; // Passed from App.tsx
    onLogout: () => void;
}

// 4. Define a type for the live edits
type LiveEditState = Record<string, any> | null;

export default function FinanceDashboard({ user: _user, onLogout }: FinanceDashboardProps) {
    // 5. Type all state hooks
    const [transactions, setTransactions] = useState<FormattedFinanceTransaction[]>([]);
    const [filter, setFilter] = useState<string>('');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailResponse['data'] | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [liveEdits, setLiveEdits] = useState<LiveEditState>(null); 
    const [liveKpis, setLiveKpis] = useState<KpiCalculationResponse['data'] | null>(null);
    const [editedFixedCosts, setEditedFixedCosts] = useState<FixedCost[] | null>(null);
    const [editedRecurringServices, setEditedRecurringServices] = useState<RecurringService[] | null>(null);
    // --- NEW STATE ---
    const [isCodeManagerOpen, setIsCodeManagerOpen] = useState<boolean>(false); // <-- NEW

    // 6. Type async functions
    const fetchTransactions = async (): Promise<void> => {
        setIsLoading(true);
        setApiError(null);
        
        const result = await getFinanceTransactions(currentPage); 
        
        if (result.success) {
            setTransactions(result.data || []); // Handle undefined
            setTotalPages(result.pages || 1); // Handle undefined
        } else {
            // Check for 401 specifically, though api.ts should handle redirect
            if ((result as any).status === 401) {
                onLogout(); 
                return;
            }
            setApiError(result.error || 'Unknown error');
        }
        setIsLoading(false);
    };

    // --- NEW HANDLER ---
    const handleFixedCostAdd = (newCosts: FixedCost[]) => {
        if (!editedFixedCosts) return;

        // 1. Merge the new costs with the existing ones
        const combinedCosts = [...editedFixedCosts, ...newCosts];
        
        // 2. Update state and trigger recalculation (using finance's recalculate function)
        setEditedFixedCosts(combinedCosts);
        handleRecalculate('fixed_costs', combinedCosts);
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage, onLogout]); // Add onLogout to dependency array

    // ... (stats calculation remains the same)
    const stats = useMemo(() => {
        const transactionList = transactions || []; // FIX: Defensive check against undefined/null

        const totalApprovedValue = transactionList
            .filter(t => t.status === 'APPROVED')
            .reduce((acc, t) => acc + (t.MRC || 0), 0); // Use MRC as a placeholder
        const averageMargin = transactionList.length > 0
            ? transactionList.reduce((acc, t) => acc + t.grossMarginRatio, 0) / transactionList.length
            : 0;
        const highRiskDeals = transactionList.filter(t => t.payback > 36).length;
        const dealsThisMonth = transactionList.filter(t => {
            const submissionDate = new Date(t.submissionDate);
            const today = new Date();
            return submissionDate.getMonth() === today.getMonth() &&
                        submissionDate.getFullYear() === today.getFullYear();
        }).length;

        return {
            totalApprovedValue: `${(totalApprovedValue / 1000000).toFixed(2)}M`,
            averageMargin: `${(averageMargin * 100).toFixed(2)}%`,
            highRiskDeals,
            dealsThisMonth,
        };
    }, [transactions]);
    
    // ... (filteredTransactions remains the same)
    const filteredTransactions = useMemo(() => {
        const transactionList = transactions || []; // FIX: Defensive check against undefined/null

        return transactionList.filter(t => {
            const clientMatch = t.clientName.toLowerCase().includes(filter.toLowerCase());
            if (!selectedDate) return clientMatch;
            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);

    // 7. Type event handlers
    const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
    const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };

    const handleRowClick = async (transaction: FormattedFinanceTransaction) => {
        setApiError(null);
        setLiveEdits(null);
        setLiveKpis(null);
        setEditedFixedCosts(null); 
        setEditedRecurringServices(null);
        
        const result = await getTransactionDetails(transaction.id);
        
        if (result.success) {
            setSelectedTransaction(result.data);
            setEditedFixedCosts(result.data.fixed_costs || []); 
            setEditedRecurringServices(result.data.recurring_services || []);
            setIsDetailModalOpen(true);
        } else {
            if ((result as any).status === 401) {
                onLogout();
                return;
            }
            setApiError(result.error || 'Unknown error');
        }
    };

    const handleRecurringServiceChange = (index: number, field: keyof RecurringService, value: any) => {
        if (!editedRecurringServices) return;

        const newServices = [...editedRecurringServices];
        // A bit of type assertion to make this work
        (newServices[index] as any)[field] = value;
        
        setEditedRecurringServices(newServices);
        handleRecalculate('recurring_services', newServices);
    };

    const handleFixedCostChange = (index: number, field: keyof FixedCost, value: string | number) => {
        if (!editedFixedCosts) return;

        const newCosts = [...editedFixedCosts]; 
        // The cast to 'any' here is still an anti-pattern (as discussed before) 
        // but the value parameter is now correctly typed as string | number.
        (newCosts[index] as any)[field] = value; 
        
        setEditedFixedCosts(newCosts); 
        handleRecalculate('fixed_costs', newCosts);
    };

    const handleRecalculate = async (key: string, value: any) => {
        if (!selectedTransaction) return;
        setApiError(null);
        
        if (key !== 'fixed_costs' && key !== 'recurring_services') {
            setLiveEdits(prev => ({ ...prev, [key]: value }));
        }

        const baseTransaction = selectedTransaction.transactions;
        const currentEdits: LiveEditState = { ...liveEdits, [key]: value }; 

        let costsForPayload: FixedCost[] | null;
        if (key === 'fixed_costs') {
            costsForPayload = value as FixedCost[]; 
        } else {
            costsForPayload = editedFixedCosts; 
        }

        let servicesForPayload: RecurringService[] | null;
        if (key === 'recurring_services') {
            servicesForPayload = value as RecurringService[];
        } else {
            servicesForPayload = editedRecurringServices;
        }

        const payloadUpdates = {
             unidadNegocio: currentEdits?.unidadNegocio ?? baseTransaction.unidadNegocio,
             gigalan_region: currentEdits?.gigalan_region ?? baseTransaction.gigalan_region,
             gigalan_sale_type: currentEdits?.gigalan_sale_type ?? baseTransaction.gigalan_sale_type,
             gigalan_old_mrc: currentEdits?.gigalan_old_mrc ?? baseTransaction.gigalan_old_mrc,
             plazoContrato: currentEdits?.plazoContrato ?? baseTransaction.plazoContrato,
             MRC: currentEdits?.MRC ?? baseTransaction.MRC,
             NRC: currentEdits?.NRC ?? baseTransaction.NRC,
             mrc_currency: currentEdits?.mrc_currency ?? baseTransaction.mrc_currency,
             nrc_currency: currentEdits?.nrc_currency ?? baseTransaction.nrc_currency,
        };
        
        const recalculationPayload = {
            ...selectedTransaction,     
            fixed_costs: costsForPayload,
            recurring_services: servicesForPayload,
            transactions: {
                ...baseTransaction,
                ...payloadUpdates
            }
        };

        delete (recalculationPayload as any).timeline;

        try {
            const result = await calculatePreview(recalculationPayload); 

            if (result.success) {
                setLiveKpis(result.data || null);
            } else {
                if ((result as any).status === 401) {
                    onLogout();
                    return;
                }
                setApiError(result.error || 'Failed to update KPIs.');
                setLiveKpis(null);
            }
        } catch (error: any) {
            setApiError('Network error calculating preview.');
            setLiveKpis(null);
        }
    };

    const handleUpdateStatus = async (transactionId: number, status: 'approve' | 'reject') => {
        if (!selectedTransaction) return; // Guard
        setApiError(null);
        
        const modifiedFields = {
            ...selectedTransaction.transactions,
            ...liveEdits,
        };
        
        const result = await updateTransactionStatus(
            transactionId, 
            status, 
            modifiedFields, 
            editedFixedCosts,
            editedRecurringServices
        );
        
        if (result.success) {
            setIsDetailModalOpen(false);
            setLiveEdits(null); 
            setLiveKpis(null); 
            setEditedFixedCosts(null); 
            setEditedRecurringServices(null);
            fetchTransactions(); 
        } else {
             if ((result as any).status === 401) {
                onLogout();
                return;
            }
            setApiError(result.error || 'Unknown error');
        }
    };

    const handleCalculateCommission = async (transactionId: number) => {
        setApiError(null);
        const result = await calculateCommission(transactionId);
        
        if (result.success) { 
            setSelectedTransaction(result.data); 
            setEditedFixedCosts(result.data.fixed_costs || []);
            setEditedRecurringServices(result.data.recurring_services || []);
            fetchTransactions(); 
        } else {
             if ((result as any).status === 401) {
                onLogout();
                return;
             }
             setApiError(result.error || 'Unknown error');
        }
    };

    const handleApprove = (transactionId: number) => { handleUpdateStatus(transactionId, 'approve'); };
    const handleReject = (transactionId: number) => { handleUpdateStatus(transactionId, 'reject'); };

    return (
        <>
            <div className="container mx-auto px-8 py-8">    
                <FinanceStatsGrid stats={stats} />
        
                <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                    <FinanceToolBar
                        filter={filter}
                        setFilter={setFilter}
                        isDatePickerOpen={isDatePickerOpen}
                        setIsDatePickerOpen={setIsDatePickerOpen}
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        datePickerRef={datePickerRef}
                        onClearDate={handleClearDate}
                        onSelectToday={handleSelectToday}
                    />
                    
                    <TransactionList
                        isLoading={isLoading}
                        transactions={filteredTransactions}
                        onRowClick={handleRowClick}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
            
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            
            {selectedTransaction && (
                <DataPreviewModal 
                    isOpen={isDetailModalOpen} 
                    title={`Transaction ID: ${selectedTransaction.transactions.transactionID || selectedTransaction.transactions.id}`}
                    onClose={() => { setIsDetailModalOpen(false); setLiveEdits(null); setLiveKpis(null); setIsCodeManagerOpen(false); }} // <-- Close manager on modal close
                    footer={
                        <FinancePreviewFooter 
                            tx={selectedTransaction.transactions} 
                            onApprove={handleApprove} 
                            onReject={handleReject} 
                            onCalculateCommission={handleCalculateCommission} 
                        />
                    }
                >
                    <TransactionPreviewContent
                        isFinanceView={true}
                        data={selectedTransaction} 
                        liveKpis={liveKpis} 
                        gigalanInputs={liveEdits} 
                        onGigalanInputChange={handleRecalculate} 
                        selectedUnidad={liveEdits?.unidadNegocio ?? selectedTransaction.transactions.unidadNegocio}
                        onUnidadChange={(value: string) => handleRecalculate('unidadNegocio', value)}
                        fixedCostsData={editedFixedCosts} 
                        onFixedCostChange={handleFixedCostChange}
                        recurringServicesData={editedRecurringServices}
                        onRecurringServiceChange={handleRecurringServiceChange}
                        // **NEW PROPS**
                        isCodeManagerOpen={isCodeManagerOpen}
                        setIsCodeManagerOpen={setIsCodeManagerOpen}
                        onFixedCostAdd={handleFixedCostAdd} // Finance can add costs too
                    />
                </DataPreviewModal>
            )}
        </>
    );
}