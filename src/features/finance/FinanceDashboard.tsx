// src/features/finance/FinanceDashboard.tsx
import { useState, useMemo } from 'react';
import { FinanceStatsGrid } from './components/FinanceStatsGrid'; 
import { FinanceToolBar } from './components/FinanceToolBar'; 
import { TransactionList } from './components/TransactionList'; 
import DataPreviewModal from '../../components/shared/DataPreviewModal'; 
import { TransactionPreviewContent } from '../transactions/components/TransactionPreviewContent'; 
import { FinancePreviewFooter } from './components/FinancePreviewFooter'; 
import { 
    getTransactionDetails, 
    updateTransactionStatus, 
    calculateCommission,
    type FormattedFinanceTransaction 
} from './financeService';
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard'; 

import type { 
    User, 
    TransactionDetailResponse, 
    KpiCalculationResponse, 
    FixedCost, 
    RecurringService 
} from '@/types'; 

// Define component props
interface FinanceDashboardProps {
    user: User; // Passed from App.tsx
    onLogout: () => void;
}

type LiveEditState = Record<string, any> | null; 

export default function FinanceDashboard({ user, onLogout }: FinanceDashboardProps) {
    // --- LOCAL FINANCE-SPECIFIC STATE ---
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailResponse['data'] | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [liveEdits, setLiveEdits] = useState<LiveEditState>(null);


    // --- HOOK CONSUMPTION ---
    const { 
        transactions, isLoading, currentPage, totalPages, setCurrentPage,
        filter, setFilter, isDatePickerOpen, setIsDatePickerOpen, selectedDate, setSelectedDate, datePickerRef, handleClearDate, handleSelectToday, filteredTransactions,
        apiError, setApiError, liveKpis, setLiveKpis,
        editedFixedCosts, setEditedFixedCosts, editedRecurringServices, setEditedRecurringServices,
        isCodeManagerOpen, setIsCodeManagerOpen,
        handleRecalculate, handleFixedCostAdd, handleFixedCostRemove, // These two handlers require baseTransaction now
        fetchTransactions,
    } = useTransactionDashboard({ user, view: 'FINANCE', onLogout });


    // --- HOOK WRAPPERS (FIX) ---
    
    // FIX 1: Wrapper for the Fixed Cost removal handler
    const handleFixedCostRemoveWrapper = (codeToRemove: string) => {
        if (!selectedTransaction) return;
        // Pass the base transaction data object as the second argument
        handleFixedCostRemove(codeToRemove, selectedTransaction); 
    };

    // FIX 2: Wrapper for the Fixed Cost addition handler
    const handleFixedCostAddWrapper = (newCosts: FixedCost[]) => {
        if (!selectedTransaction) return;
        // Pass the base transaction data object as the second argument
        handleFixedCostAdd(newCosts, selectedTransaction);
    };

    // ... (stats calculation remains the same) ...
    const stats = useMemo(() => {
        const transactionList = transactions as FormattedFinanceTransaction[];

        const totalApprovedValue = transactionList
            .filter(t => t.status === 'APPROVED')
            .reduce((acc, t) => acc + (t.MRC || 0), 0); 
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
    
    // ... (rest of handlers like handleClearDate, handleSelectToday, handleRowClick remain the same) ...

    const handleRowClick = async (transaction: FormattedFinanceTransaction) => {
        setApiError(null);
        setLiveEdits(null);
        setLiveKpis(null);
        setEditedFixedCosts(null); 
        setEditedRecurringServices(null);
        setIsCodeManagerOpen(false); 
        
        const result = await getTransactionDetails(transaction.id); 
        
        if (result.success) {
            setSelectedTransaction(result.data);
            setEditedFixedCosts(result.data.fixed_costs || []); 
            setEditedRecurringServices(result.data.recurring_services || []);
            setIsDetailModalOpen(true);
        } else {
            setApiError(result.error || 'Unknown error');
        }
    };

    // Handler for changes inside the preview modal
    const handleRecalculateWrapper = async (key: string, value: any) => {
        if (!selectedTransaction) return;

        // Update local live edits state
        if (key !== 'fixed_costs' && key !== 'recurring_services') {
            setLiveEdits(prev => ({ ...prev, [key]: value }));
        }
        
        // Pass the base transaction data to the hook for calculation
        await handleRecalculate(key, value, selectedTransaction);
    };

    const handleUpdateStatus = async (transactionId: number, status: 'approve' | 'reject') => {
        if (!selectedTransaction) return; 
        setApiError(null);
        
        const modifiedFields = {
            ...selectedTransaction.transactions,
            ...liveEdits,
        };
        
        const result = await updateTransactionStatus( 
            transactionId, status, modifiedFields, editedFixedCosts, editedRecurringServices
        );
        
        if (result.success) {
            setIsDetailModalOpen(false);
            setLiveEdits(null); setLiveKpis(null); 
            setEditedFixedCosts(null); setEditedRecurringServices(null);
            setIsCodeManagerOpen(false);
            fetchTransactions(); 
        } else {
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
             setApiError(result.error || 'Unknown error');
        }
    };

    const handleApprove = (transactionId: number) => { handleUpdateStatus(transactionId, 'approve'); };
    const handleReject = (transactionId: number) => { handleUpdateStatus(transactionId, 'reject'); };
    
    // Handler for updates to Recurring Services table within modal
    const handleRecurringServiceChange = (index: number, field: keyof RecurringService, value: any) => {
        if (!editedRecurringServices) return;

        setEditedRecurringServices(prev => {
            const newServices = [...(prev || [])];
            (newServices[index] as any)[field] = value;
            handleRecalculateWrapper('recurring_services', newServices);
            return newServices;
        });
    };
    
    // Handler for updates to Fixed Costs table within modal
    const handleFixedCostChange = (index: number, field: keyof FixedCost, value: string | number) => {
        if (!editedFixedCosts) return;

        setEditedFixedCosts(prev => {
            const newCosts = [...(prev || [])];
            (newCosts[index] as any)[field] = value;
            handleRecalculateWrapper('fixed_costs', newCosts);
            return newCosts;
        });
    };


    return (
        <>
            <div className="container mx-auto px-8 py-8">    
                <FinanceStatsGrid stats={stats} />
        
                <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                    <FinanceToolBar
                        filter={filter} setFilter={setFilter}
                        isDatePickerOpen={isDatePickerOpen} setIsDatePickerOpen={setIsDatePickerOpen}
                        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                        datePickerRef={datePickerRef}
                        onClearDate={handleClearDate} onSelectToday={handleSelectToday}
                    />
                    
                    <TransactionList
                        isLoading={isLoading}
                        transactions={filteredTransactions as FormattedFinanceTransaction[]}
                        onRowClick={handleRowClick}
                        currentPage={currentPage} totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
            
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            
            {selectedTransaction && (
                <DataPreviewModal 
                    isOpen={isDetailModalOpen} 
                    title={`Transaction ID: ${selectedTransaction.transactions.transactionID || selectedTransaction.transactions.id}`}
                    onClose={() => { setIsDetailModalOpen(false); setLiveEdits(null); setLiveKpis(null); setIsCodeManagerOpen(false); }}
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
                        onGigalanInputChange={handleRecalculateWrapper} 
                        selectedUnidad={liveEdits?.unidadNegocio ?? selectedTransaction.transactions.unidadNegocio}
                        onUnidadChange={(value: string) => handleRecalculateWrapper('unidadNegocio', value)}
                        fixedCostsData={editedFixedCosts} 
                        onFixedCostChange={handleFixedCostChange}
                        recurringServicesData={editedRecurringServices}
                        onRecurringServiceChange={handleRecurringServiceChange}
                        // HOOK-BASED PROPS (FIXED)
                        isCodeManagerOpen={isCodeManagerOpen}
                        setIsCodeManagerOpen={setIsCodeManagerOpen}
                        onFixedCostAdd={handleFixedCostAddWrapper} // FIX: Use wrapper
                        onFixedCostRemove={handleFixedCostRemoveWrapper} // FIX: Use wrapper
                    />
                </DataPreviewModal>
            )}
        </>
    );
}