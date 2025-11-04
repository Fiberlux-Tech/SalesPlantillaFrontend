// src/features/transactions/FinanceDashboard.tsx
import { useState, useMemo } from 'react';
import DataPreviewModal from '@/components/shared/DataPreviewModal';
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext';
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard';
import { useAuth } from '@/contexts/AuthContext'; // <-- 1. Import the hook
// import type { User, Transaction, TransactionDetailResponse, FixedCost, RecurringService } from '@/types';
import type { Transaction, TransactionDetailResponse, FixedCost, RecurringService } from '@/types';


// ... (Import Finance-specific components) ...
import { FinanceStatsGrid } from './components/FinanceStatsGrid';
import { TransactionList as FinanceTransactionList } from './components/FinanceTransactionList';
import { TransactionPreviewContent } from './components/TransactionPreviewContent';
import { FinancePreviewFooter } from './footers/FinancePreviewFooter';
import { TransactionDashboardLayout } from './components/TransactionDashboardLayout';

// ... (Import Finance-specific services) ...
import {
    getTransactionDetails,
    updateTransactionStatus,
    calculateCommission,
    type FormattedFinanceTransaction
} from './services/finance.service';

interface FinanceDashboardProps {
    // 2. REMOVE user and onLogout props
    // user: User;
    // onLogout: () => void;
}

export default function FinanceDashboard({}: FinanceDashboardProps) { // <-- 3. Remove props
    
    const { user, logout } = useAuth(); // <-- 4. Get user and logout from context

    // 5. Add a check for user
    if (!user) {
        return <div className="text-center py-12">Loading user data...</div>;
    }

    // --- HOOK (Now pass context data) ---
    const {
        transactions, isLoading, currentPage, totalPages, setCurrentPage,
        filter, setFilter, isDatePickerOpen, setIsDatePickerOpen, selectedDate, setSelectedDate, datePickerRef, handleClearDate, handleSelectToday, filteredTransactions,
        apiError, setApiError,
        fetchTransactions,
    } = useTransactionDashboard({ 
        user, 
        view: 'FINANCE', 
        onLogout: logout // <-- 6. Pass logout from context
    });

    // ... (All other state, handlers, and render logic remain exactly the same) ...
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailResponse['data'] | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

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

    const handleRowClick = async (transaction: FormattedFinanceTransaction) => {
        setApiError(null);
        setSelectedTransaction(null);
        const result = await getTransactionDetails(transaction.id);
        if (result.success) {
            setSelectedTransaction(result.data);
            setIsDetailModalOpen(true);
        } else {
            setApiError(result.error || 'Unknown error');
        }
    };

    const handleUpdateStatus = async (
        transactionId: number,
        status: 'approve' | 'reject',
        modifiedData: Partial<Transaction>,
        fixedCosts: FixedCost[] | null,
        recurringServices: RecurringService[] | null
    ) => {
        setApiError(null);
        const result = await updateTransactionStatus(transactionId, status, modifiedData, fixedCosts, recurringServices);
        if (result.success) {
            setIsDetailModalOpen(false);
            setSelectedTransaction(null);
            fetchTransactions(currentPage);
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const handleCalculateCommission = async (transactionId: number) => {
        setApiError(null);
        const result = await calculateCommission(transactionId);
        if (result.success) {
            setSelectedTransaction(result.data);
            fetchTransactions(currentPage);
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const handleCloseFinanceModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTransaction(null);
    };

    return (
        <>
            <TransactionDashboardLayout
                apiError={apiError}
                placeholder={"Filter by client name..."}
                filter={filter}
                setFilter={setFilter}
                isDatePickerOpen={isDatePickerOpen}
                setIsDatePickerOpen={setIsDatePickerOpen}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                datePickerRef={datePickerRef}
                onClearDate={handleClearDate}
                onSelectToday={handleSelectToday}
                statsGrid={
                    <FinanceStatsGrid stats={stats} />
                }
                transactionList={
                    <FinanceTransactionList
                        isLoading={isLoading}
                        transactions={filteredTransactions as FormattedFinanceTransaction[]}
                        onRowClick={handleRowClick}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                }
            />

            {selectedTransaction && (
                <TransactionPreviewProvider
                    baseTransaction={selectedTransaction}
                    view="FINANCE"
                >
                    <DataPreviewModal
                        isOpen={isDetailModalOpen}
                        title={`Transaction ID: ${selectedTransaction.transactions.transactionID || selectedTransaction.transactions.id}`}
                        onClose={handleCloseFinanceModal}
                        footer={
                            <FinancePreviewFooter
                                onApprove={handleUpdateStatus}
                                onReject={handleUpdateStatus}
                                onCalculateCommission={handleCalculateCommission}
                            />
                        }
                    >
                        <TransactionPreviewContent isFinanceView={true} />
                    </DataPreviewModal>
                </TransactionPreviewProvider>
            )}
        </>
    );
}