// src/features/transactions/SalesDashboard.tsx
import { useState, useMemo, useEffect } from 'react';
// import { DashboardToolbar } from '@/components/shared/DashboardToolBar'; // No longer needed
import DataPreviewModal from '@/components/shared/DataPreviewModal';
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext';
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard';
import type { User, TransactionDetailResponse } from '@/types';

// Import Sales-specific components
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesTransactionList } from './components/SalesTransactionList';
import FileUploadModal from './components/FileUploadModal';
import { TransactionPreviewContent } from './components/TransactionPreviewContent';
import { SalesPreviewFooter } from './footers/SalesPreviewFooter';
import { TransactionDashboardLayout } from './components/TransactionDashboardLayout'; // <-- 1. Import new layout

// Import Sales-specific services and types
import {
    uploadExcelForPreview,
    submitFinalTransaction,
    type FormattedSalesTransaction
} from './services/sales.service';

interface SalesDashboardProps {
    user: User;
    setSalesActions: (actions: { onUpload: () => void, onExport: () => void }) => void;
    onLogout: () => void;
}

export default function SalesDashboard({ user, setSalesActions, onLogout }: SalesDashboardProps) {
    
    // --- HOOK (Unchanged) ---
    const {
        transactions, isLoading, currentPage, totalPages, setCurrentPage,
        filter, setFilter, isDatePickerOpen, setIsDatePickerOpen, selectedDate, setSelectedDate, datePickerRef, handleClearDate, handleSelectToday, filteredTransactions,
        apiError, setApiError,
        fetchTransactions,
    } = useTransactionDashboard({ 
        user, 
        view: 'SALES', 
        onLogout
    });

    // --- STATE & HANDLERS (Unchanged) ---
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

    // --- RENDER (Refactored) ---
    return (
        <>
            {/* 2. Use the new layout component */}
            <TransactionDashboardLayout
                apiError={apiError}
                placeholder={"Filtra por nombre de cliente..."}
                // Pass all toolbar props
                filter={filter}
                setFilter={setFilter}
                isDatePickerOpen={isDatePickerOpen}
                setIsDatePickerOpen={setIsDatePickerOpen}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                datePickerRef={datePickerRef}
                onClearDate={handleClearDate}
                onSelectToday={handleSelectToday}
                
                // 3. Pass Stats Grid as a slot
                statsGrid={
                    <SalesStatsGrid stats={stats} />
                }
                
                // 4. Pass Transaction List as a slot
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

            {/* 5. Keep Modals here, as they are specific to Sales */}
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