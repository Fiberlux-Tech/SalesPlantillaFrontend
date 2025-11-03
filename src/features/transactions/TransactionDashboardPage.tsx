// src/features/transactions/TransactionDashboardPage.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { DashboardToolbar } from '@/components/shared/DashboardToolBar';
import DataPreviewModal from '@/components/shared/DataPreviewModal';
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext';
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard';
import type { User, Transaction, TransactionDetailResponse, FixedCost, RecurringService } from '@/types';

// Import all consolidated components
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { FinanceStatsGrid } from './components/FinanceStatsGrid';
import { SalesTransactionList } from './components/SalesTransactionList';
// --- THIS IS THE FIX ---
// Import 'TransactionList' and rename it 'as FinanceTransactionList'
import { TransactionList as FinanceTransactionList } from './components/FinanceTransactionList';
// --- END OF FIX ---
import FileUploadModal from './components/FileUploadModal';
import { TransactionPreviewContent } from './components/TransactionPreviewContent';
import { SalesPreviewFooter } from './footers/SalesPreviewFooter';
import { FinancePreviewFooter } from './footers/FinancePreviewFooter';

// Import all consolidated services
import {
    uploadExcelForPreview,
    submitFinalTransaction,
    getTransactionDetails,
    updateTransactionStatus,
    calculateCommission,
    type FormattedSalesTransaction,
    type FormattedFinanceTransaction
} from './transactionService';

// Define props for the new page
interface TransactionDashboardPageProps {
    user: User;
    view: 'SALES' | 'FINANCE';
    setSalesActions: (actions: { onUpload: () => void, onExport: () => void }) => void;
    onLogout: () => void;
}

export default function TransactionDashboardPage({ user, view, setSalesActions, onLogout }: TransactionDashboardPageProps) {
    
    // --- STATE FOR BOTH VIEWS ---
    
    // This hook provides shared logic for lists, filtering, and pagination
    const {
        transactions, isLoading, currentPage, totalPages, setCurrentPage,
        filter, setFilter, isDatePickerOpen, setIsDatePickerOpen, selectedDate, setSelectedDate, datePickerRef, handleClearDate, handleSelectToday, filteredTransactions,
        apiError, setApiError,
        fetchTransactions,
    } = useTransactionDashboard({ user, view, onLogout });

    // --- SALES-SPECIFIC MODAL STATE ---
    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
    const [uploadedData, setUploadedData] = useState<TransactionDetailResponse['data'] | null>(null);

    // --- FINANCE-SPECIFIC MODAL STATE ---
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailResponse['data'] | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

    // --- EFFECT TO SET SALES ACTIONS (conditional) ---
    useEffect(() => {
        if (view === 'SALES' && setSalesActions) {
            setSalesActions({
                onUpload: () => setIsUploadModalOpen(true),
                onExport: () => alert('Exporting sales data is not implemented yet!')
            });
            return () => {
                setSalesActions({
                    onUpload: () => console.log('Upload not yet available'),
                    onExport: () => console.log('Export not yet available')
                });
            };
        }
    }, [view, setSalesActions]);

    // --- STATS CALCULATION (conditional) ---
    const stats = useMemo(() => {
        if (view === 'SALES') {
            const pendingApprovals = transactions.filter(t => t.status === 'PENDING').length;
            const totalValue = 0; // Placeholder
            const avgIRR = 24.5; // Placeholder
            const avgPayback = 20; // Placeholder
            return {
                pendingApprovals,
                totalValue: `${(totalValue / 1000000).toFixed(2)}M`,
                avgIRR: `${avgIRR}%`,
                avgPayback: `${avgPayback} mo`,
            };
        } else {
            // Finance stats logic
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
        }
    }, [transactions, view]);


    // --- SALES HANDLERS ---
    const handleUploadNext = async (file: File | null) => {
        if (!file) return;
        setApiError(null);
        const result = await uploadExcelForPreview(file);
        if (result.success && result.data) {
            setUploadedData(result.data);
            setIsUploadModalOpen(false);
            setIsPreviewModalOpen(true);
        } else {
            setApiError(result.error || 'Unknown upload error');
            setIsUploadModalOpen(false);
        }
    };

    const handleConfirmSubmission = async (finalData: TransactionDetailResponse['data']) => {
        setApiError(null);
        const finalPayload = { ...finalData, transactions: { ...finalData.transactions } };
        delete (finalPayload as any).timeline;

        const result = await submitFinalTransaction(finalPayload);
        if (result.success) {
            fetchTransactions(1);
            setIsPreviewModalOpen(false);
            setUploadedData(null);
        } else {
            alert(result.error || 'Unknown submission error');
        }
    };
    
    const handleCloseSalesModal = () => {
        setIsPreviewModalOpen(false);
        setUploadedData(null);
    };

    // --- FINANCE HANDLERS ---
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

    // --- RENDER ---
    return (
        <>
            <div className="container mx-auto px-8 py-8">
                {/* 1. Render correct Stats Grid */}
                {view === 'SALES' 
                    ? <SalesStatsGrid stats={stats as any} /> 
                    : <FinanceStatsGrid stats={stats as any} />
                }

                <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                    {/* 2. Render Shared Toolbar */}
                    <DashboardToolbar
                        filter={filter} setFilter={setFilter}
                        isDatePickerOpen={isDatePickerOpen} setIsDatePickerOpen={setIsDatePickerOpen}
                        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                        datePickerRef={datePickerRef}
                        onClearDate={handleClearDate} onSelectToday={handleSelectToday}
                        placeholder={view === 'SALES' ? "Filtra por nombre de cliente..." : "Filter by client name..."}
                    />

                    {/* 3. Render correct Transaction List */}
                    {view === 'SALES' ? (
                        <SalesTransactionList
                            isLoading={isLoading}
                            transactions={filteredTransactions as FormattedSalesTransaction[]}
                            currentPage={currentPage} totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    ) : (
                        <FinanceTransactionList
                            isLoading={isLoading}
                            transactions={filteredTransactions as FormattedFinanceTransaction[]}
                            onRowClick={handleRowClick}
                            currentPage={currentPage} totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>

            {/* API Error for the list/upload page */}
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}

            {/* 4. Render SALES Modals */}
            {view === 'SALES' && (
                <>
                    <FileUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onNext={handleUploadNext} />
                    
                    {uploadedData && (
                        <TransactionPreviewProvider
                            baseTransaction={uploadedData}
                            view="SALES"
                        >
                            <DataPreviewModal
                                isOpen={isPreviewModalOpen}
                                title={`Preview: ${uploadedData.fileName}`}
                                onClose={handleCloseSalesModal}
                                footer={
                                    <SalesPreviewFooter
                                        onConfirm={handleConfirmSubmission}
                                        onClose={handleCloseSalesModal}
                                    />
                                }
                            >
                                <TransactionPreviewContent isFinanceView={false} />
                            </DataPreviewModal>
                        </TransactionPreviewProvider>
                    )}
                </>
            )}

            {/* 5. Render FINANCE Modals */}
            {view === 'FINANCE' && selectedTransaction && (
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