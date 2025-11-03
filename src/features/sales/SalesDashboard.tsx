// src/features/sales/SalesDashboard.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesTransactionList } from './components/SalesTransactionList';
import { DashboardToolbar } from '@/components/shared/DashboardToolBar'; // Use shared toolbar
import FileUploadModal from './components/FileUploadModal';
import DataPreviewModal from '../../components/shared/DataPreviewModal';
import { TransactionPreviewContent } from '../transactions/components/TransactionPreviewContent'; 
import { SalesPreviewFooter } from './components/SalesPreviewFooter'; 
import { 
    uploadExcelForPreview, 
    submitFinalTransaction,
    FormattedSalesTransaction 
} from './salesService'; 
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard'; 
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext'; // <-- NEW IMPORT

import type { 
    User, 
    TransactionDetailResponse, 
    FixedCost,
    RecurringService 
} from '@/types';

// Define props for the dashboard
interface SalesDashboardProps {
    user: User;
    setSalesActions: (actions: { onUpload: () => void, onExport: () => void }) => void;
}

// These local interfaces remain as they are part of the *Sales-specific* UI flow
interface GigalanInputs {
    gigalan_region: string;
    gigalan_sale_type: "NUEVO" | "EXISTENTE" | "";
    gigalan_old_mrc: number | null;
}
interface OverrideFields {
    plazoContrato: number | null;
    MRC: number | null;
    mrc_currency: "PEN" | "USD" | null;
    NRC: number | null;
    nrc_currency: "PEN" | "USD" | null;
}


export default function SalesDashboard({ user: _user, setSalesActions }: SalesDashboardProps) {
    // --- LOCAL SALES-SPECIFIC STATE (Modal state is removed) ---
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
    const [uploadedData, setUploadedData] = useState<TransactionDetailResponse['data'] | null>(null);
    // --- All 'live', 'edited', 'apiError' states are REMOVED ---
    const salesOnLogout = useCallback(() => {}, []);


    // --- HOOK CONSUMPTION (Simplified: modal logic is removed) ---
    const { 
        transactions, isLoading, currentPage, totalPages, setCurrentPage,
        filter, setFilter, isDatePickerOpen, setIsDatePickerOpen, selectedDate, setSelectedDate, datePickerRef, handleClearDate, handleSelectToday, filteredTransactions,
        apiError, setApiError, // This is the API error for the *list*
        fetchTransactions, // Use this to refetch the list
    } = useTransactionDashboard({ user: _user, view: 'SALES', onLogout: salesOnLogout });
    

    // useEffect for setSalesActions remains the same
    useEffect(() => {
        if (setSalesActions) {
            setSalesActions({
                onUpload: () => setIsModalOpen(true),
                onExport: () => alert('Exporting sales data is not implemented yet!') 
            });
            return () => {
                setSalesActions({ 
                    onUpload: () => console.log('Upload not yet available'), 
                    onExport: () => console.log('Export not yet available') 
                });
            };
        }
    }, [setSalesActions]);


    // stats calculation remains the same
    const stats = useMemo(() => {
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


    // --- HANDLERS (Simplified) ---
    
    // Handles initial Excel upload and data setup
    const handleUploadNext = async (file: File | null) => {
        if (!file) return;
        setApiError(null); // Clear list error
        
        const result = await uploadExcelForPreview(file);

        if (result.success && result.data) {
            setUploadedData(result.data); // Just set the base data for the context
            setIsModalOpen(false);
            setIsPreviewModalOpen(true);
        } else {
            // This error is for the *upload*, show it locally
            setApiError(result.error || 'Unknown upload error');
            setIsModalOpen(false);
        }
    };

    // This handler is passed to the footer, which gets context data
    const handleConfirmSubmission = async (
        finalData: TransactionDetailResponse['data'] // Receives payload from context-aware footer
    ) => {
        setApiError(null);
        
        // The final payload is passed up from the context-aware footer
        const finalPayload = {
            ...finalData,
            transactions: {
                ...finalData.transactions
            }
        };
        delete (finalPayload as any).timeline;

        const result = await submitFinalTransaction(finalPayload);

        if (result.success) {
            fetchTransactions(1); // Reload transactions list (go to page 1)
            setIsPreviewModalOpen(false);
            setUploadedData(null);
        } else {
            // In a real app, we'd set this error in the context
            alert(result.error || 'Unknown submission error');
        }
    };
    
    // Modal close handler
    const handleCloseModal = () => {
        setIsPreviewModalOpen(false);
        setUploadedData(null);
    };
    

    // --- RENDER ---
    return (
        <>
            <div className="container mx-auto px-8 py-8">
            <SalesStatsGrid stats={stats} />
                <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                    {/* Use the new shared DashboardToolbar */}
                    <DashboardToolbar
                        filter={filter} setFilter={setFilter}
                        isDatePickerOpen={isDatePickerOpen} setIsDatePickerOpen={setIsDatePickerOpen}
                        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                        datePickerRef={datePickerRef}
                        onClearDate={handleClearDate} onSelectToday={handleSelectToday}
                        placeholder="Filtra por nombre de cliente..."
                    />
                    <SalesTransactionList
                        isLoading={isLoading}
                        transactions={filteredTransactions as FormattedSalesTransaction[]}
                        currentPage={currentPage} totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Modals */}
            {/* This is the API error for the *list* or *upload* */}
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            <FileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNext={handleUploadNext} />
            
            {/* --- WRAP THE MODAL IN THE PROVIDER --- */}
            {uploadedData && (
                <TransactionPreviewProvider
                    baseTransaction={uploadedData}
                    view="SALES"
                >
                    <DataPreviewModal
                        isOpen={isPreviewModalOpen}
                        title={`Preview: ${uploadedData.fileName}`}
                        onClose={handleCloseModal} 
                        footer={
                            <SalesPreviewFooter 
                                onConfirm={handleConfirmSubmission} 
                                onClose={handleCloseModal} 
                            />
                        }
                    >
                        {/* --- CONTENT COMPONENT NO LONGER NEEDS PROPS --- */}
                        <TransactionPreviewContent
                            isFinanceView={false}
                        />
                    </DataPreviewModal>
                </TransactionPreviewProvider>
            )}
        </>
    );
}