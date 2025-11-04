// src/features/transactions/SalesDashboard.tsx
import { useState, useMemo, useEffect } from 'react';
import DataPreviewModal from '@/components/shared/DataPreviewModal';
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext';
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard';
import { useAuth } from '@/contexts/AuthContext'; // <-- 1. Import the hook
// import type { User, TransactionDetailResponse } from '@/types'; // User no longer needed
import type { TransactionDetailResponse } from '@/types';

// ... (Import Sales-specific components) ...
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesTransactionList } from './components/SalesTransactionList';
import FileUploadModal from './components/FileUploadModal';
import { TransactionPreviewContent } from './components/TransactionPreviewContent';
import { SalesPreviewFooter } from './footers/SalesPreviewFooter';
import { TransactionDashboardLayout } from './components/TransactionDashboardLayout';

// ... (Import Sales-specific services) ...
import {
    uploadExcelForPreview,
    submitFinalTransaction,
    type FormattedSalesTransaction
} from './services/sales.service';

interface SalesDashboardProps {
    // 2. REMOVE user and onLogout props
    // user: User;
    setSalesActions: (actions: { onUpload: () => void, onExport: () => void }) => void;
    // onLogout: () => void;
}

export default function SalesDashboard({ setSalesActions }: SalesDashboardProps) { // <-- 3. Remove props
    
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
        view: 'SALES', 
        onLogout: logout // <-- 6. Pass logout from context
    });

    // ... (All other state, handlers, and render logic remain exactly the same) ...
    
    const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
    const [uploadedData, setUploadedData] = useState<TransactionDetailResponse['data'] | null>(null);

    useEffect(() => {
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
    }, [setSalesActions]);

    const stats = useMemo(() => {
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
    }, [transactions]);

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

    return (
        <>
            <TransactionDashboardLayout
                apiError={apiError}
                placeholder={"Filtra por nombre de cliente..."}
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
                    <SalesStatsGrid stats={stats} />
                }
                transactionList={
                    <SalesTransactionList
                        isLoading={isLoading}
                        transactions={filteredTransactions as FormattedSalesTransaction[]}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                }
            />
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
    );
}