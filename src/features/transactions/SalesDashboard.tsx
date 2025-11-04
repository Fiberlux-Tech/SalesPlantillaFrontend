// src/features/transactions/SalesDashboard.tsx
import { useState, useMemo, useEffect, useRef } from 'react'; // 1. Import useRef
import DataPreviewModal from '@/components/shared/DataPreviewModal';
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext';
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard';
import { useAuth } from '@/contexts/AuthContext';
import type { TransactionDetailResponse } from '@/types';
import type { RefObject } from 'react'; // 2. Import RefObject

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
    setSalesActions: (actions: { onUpload: () => void, onExport: () => void }) => void;
}

export default function SalesDashboard({ setSalesActions }: SalesDashboardProps) {

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
        view: 'SALES',
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
            const salesTx = t as FormattedSalesTransaction;
            const clientMatch = salesTx.client.toLowerCase().includes(filterLower);

            if (!selectedDate) return clientMatch;

            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);


    // --- (All other state and handlers remain the same) ---
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
        // ... (stats logic is unchanged)
        const pendingApprovals = transactions.filter(t => t.status === 'PENDING').length;
        const totalValue = 0;
        const avgIRR = 24.5;
        const avgPayback = 20;
        return {
            pendingApprovals,
            totalValue: `${(totalValue / 1000000).toFixed(2)}M`,
            avgIRR: `${avgIRR}%`,
            avgPayback: `${avgPayback} mo`,
        };
    }, [transactions]);

    const handleUploadNext = async (file: File | null) => {
        // ... (handler logic is unchanged)
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
        // ... (handler logic is unchanged)
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
            {/* 7. Pass all the local UI state down to the layout component */}
            <TransactionDashboardLayout
                apiError={apiError}
                placeholder={"Filtra por nombre de cliente..."}
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
                    <SalesStatsGrid stats={stats} />
                }
                transactionList={
                    <SalesTransactionList
                        isLoading={isLoading}
                        transactions={filteredTransactions as FormattedSalesTransaction[]}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage} // This now correctly calls the hook's setter
                    />
                }
            />
            
            {/* --- (Modal logic is unchanged) --- */}
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