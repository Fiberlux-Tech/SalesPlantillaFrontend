// src/features/finance/FinanceDashboard.tsx
import { useState, useMemo } from 'react';
import { FinanceStatsGrid } from './components/FinanceStatsGrid'; 
import { TransactionList } from './components/TransactionList'; 
import { DashboardToolbar } from '@/components/shared/DashboardToolBar';
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
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext';

import type { 
    User, 
    Transaction, // <-- THIS FIXES THE ERROR IN SCREENSHOT 1
    TransactionDetailResponse, 
    FixedCost, 
    RecurringService 
} from '@/types'; 

// Define component props
interface FinanceDashboardProps {
    user: User; // Passed from App.tsx
    onLogout: () => void;
}

export default function FinanceDashboard({ user, onLogout }: FinanceDashboardProps) {
    // --- LOCAL FINANCE-SPECIFIC STATE (Modal state is removed) ---
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailResponse['data'] | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

    // --- HOOK CONSUMPTION (Simplified: modal logic is removed) ---
    const { 
        transactions, isLoading, currentPage, totalPages, setCurrentPage,
        filter, setFilter, isDatePickerOpen, setIsDatePickerOpen, selectedDate, setSelectedDate, datePickerRef, handleClearDate, handleSelectToday, filteredTransactions,
        apiError, setApiError, // This is the API error for the *list*
        fetchTransactions, // Use this to refetch the list
    } = useTransactionDashboard({ user, view: 'FINANCE', onLogout });
    
    // Stats calculation remains the same
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
    
    // Row click handler is now much simpler
    const handleRowClick = async (transaction: FormattedFinanceTransaction) => {
        setApiError(null); // Clear list API error
        setSelectedTransaction(null); // Clear old data first
        
        const result = await getTransactionDetails(transaction.id); 
        
        if (result.success) {
            setSelectedTransaction(result.data); // Set the base data for the context
            setIsDetailModalOpen(true);
        } else {
            setApiError(result.error || 'Unknown error'); // Show list API error
        }
    };

    // This handler is passed to the footer, which gets context data
    const handleUpdateStatus = async (
        transactionId: number, 
        status: 'approve' | 'reject', 
        modifiedData: Partial<Transaction>,
        fixedCosts: FixedCost[] | null, 
        recurringServices: RecurringService[] | null
    ) => {
        setApiError(null);
        
        const result = await updateTransactionStatus( 
            transactionId, status, modifiedData, fixedCosts, recurringServices
        );
        
        if (result.success) {
            setIsDetailModalOpen(false);
            setSelectedTransaction(null);
            fetchTransactions(currentPage); // Refetch current page
        } else {
            // In a real app, we'd set this error in the context
            alert(`Error: ${result.error}`);
        }
    };

    // This handler is passed to the footer
    const handleCalculateCommission = async (transactionId: number) => {
        setApiError(null);
        const result = await calculateCommission(transactionId);
        
        if (result.success) { 
            // Update the base transaction data to re-render the provider
            setSelectedTransaction(result.data); 
            fetchTransactions(currentPage); // Refetch list
        } else {
             // In a real app, we'd set this error in the context
             alert(`Error: ${result.error}`);
        }
    };
    
    // Modal close handler
    const handleCloseModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTransaction(null);
    }


    return (
        <>
            <div className="container mx-auto px-8 py-8">    
                <FinanceStatsGrid stats={stats} />
        
                <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                    {/* Use the new shared DashboardToolbar */}
                    <DashboardToolbar
                        filter={filter} setFilter={setFilter}
                        isDatePickerOpen={isDatePickerOpen} setIsDatePickerOpen={setIsDatePickerOpen}
                        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                        datePickerRef={datePickerRef}
                        onClearDate={handleClearDate} onSelectToday={handleSelectToday}
                        placeholder="Filter by client name..."
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
            
            {/* This is the API error for the *list* page */}
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            
            {/* --- WRAP THE MODAL IN THE PROVIDER --- */}
            {selectedTransaction && (
                <TransactionPreviewProvider 
                    baseTransaction={selectedTransaction} 
                    view="FINANCE"
                >
                    <DataPreviewModal 
                        isOpen={isDetailModalOpen} 
                        title={`Transaction ID: ${selectedTransaction.transactions.transactionID || selectedTransaction.transactions.id}`}
                        onClose={handleCloseModal}
                        footer={
                            <FinancePreviewFooter 
                                // Pass the handlers down. The footer will call them using context data.
                                onApprove={handleUpdateStatus} 
                                onReject={handleUpdateStatus} 
                                onCalculateCommission={handleCalculateCommission} 
                            />
                        }
                    >
                        {/* --- CONTENT COMPONENT NO LONGER NEEDS PROPS --- */}
                        <TransactionPreviewContent
                            isFinanceView={true}
                        />
                    </DataPreviewModal>
                </TransactionPreviewProvider>
            )}
        </>
    );
}