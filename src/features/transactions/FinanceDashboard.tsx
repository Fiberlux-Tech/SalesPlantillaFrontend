// src/features/transactions/FinanceDashboard.tsx
import { useState, useMemo, useRef } from 'react'; // 1. Import useRef
import DataPreviewModal from '@/components/shared/DataPreviewModal';
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext';
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction, TransactionDetailResponse, FixedCost, RecurringService } from '@/types';
import type { RefObject } from 'react'; // 2. Import RefObject

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
    // (Props are removed)
}

export default function FinanceDashboard({}: FinanceDashboardProps) {

    const { user, logout } = useAuth();

    if (!user) {
        return <div className="text-center py-12">Loading user data...</div>;
    }

    // --- 3. HOOK (Now has a simpler return value) ---
    const {
        transactions, isLoading, currentPage, totalPages, setCurrentPage,
        apiError, setApiError,
        fetchTransactions,
    } = useTransactionDashboard({
        user,
        view: 'FINANCE',
        onLogout: logout
    });

    // --- 4. UI STATE MOVED HERE ---
    const [filter, setFilter] = useState<string>('');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    // --- 5. UI HANDLERS MOVED HERE ---
    const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
    const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };

    // --- 6. FILTER LOGIC MOVED HERE ---
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const filterLower = filter.toLowerCase();
            const financeTx = t as FormattedFinanceTransaction;
            const clientMatch = financeTx.clientName.toLowerCase().includes(filterLower);

            if (!selectedDate) return clientMatch;

            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);


    // --- (All other state and handlers remain exactly the same) ---
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailResponse['data'] | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

    const stats = useMemo(() => {
        // ... (stats logic is unchanged)
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
        // ... (handler logic is unchanged)
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
        // ... (handler logic is unchanged)
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
        // ... (handler logic is unchanged)
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
            {/* 7. Pass all the local UI state down to the layout component */}
            <TransactionDashboardLayout
                apiError={apiError}
                placeholder={"Filter by client name..."}
                filter={filter}
                setFilter={setFilter}
                isDatePickerOpen={isDatePickerOpen}
                setIsDatePickerOpen={setIsDatePickerOpen}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                datePickerRef={datePickerRef as RefObject<HTMLDivElement | null>}
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
                        onPageChange={setCurrentPage} // <-- This prop now matches
                    />
                }
            />

            {/* --- (Modal logic is unchanged) --- */}
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