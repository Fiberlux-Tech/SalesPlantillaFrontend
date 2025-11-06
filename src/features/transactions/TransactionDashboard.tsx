// src/features/transactions/TransactionDashboard.tsx
import { useState, useMemo, useEffect, useRef, RefObject } from 'react';
import { UploadIcon } from '@/components/shared/Icons';

// --- Shared Imports ---
import DataPreviewModal from '@/components/shared/DataPreviewModal';
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext';
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction, TransactionDetailResponse, FixedCost, RecurringService } from '@/types';
import { TransactionDashboardLayout } from './components/TransactionDashboardLayout';
import { TransactionPreviewContent } from './components/TransactionPreviewContent';

// --- Sales-Specific Imports ---
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesTransactionList } from './components/SalesTransactionList';
import FileUploadModal from './components/FileUploadModal';
import { SalesPreviewFooter } from './footers/SalesPreviewFooter';
import {
    uploadExcelForPreview,
    submitFinalTransaction,
    type FormattedSalesTransaction
} from './services/sales.service';

// --- Finance-Specific Imports ---
import { FinanceStatsGrid } from './components/FinanceStatsGrid';
import { TransactionList as FinanceTransactionList } from './components/FinanceTransactionList';
import { FinancePreviewFooter } from './footers/FinancePreviewFooter';
import {
    getTransactionDetails,
    updateTransactionStatus,
    calculateCommission,
    type FormattedFinanceTransaction as FormattedFinanceTx
} from './services/finance.service';

// --- Define Component Props ---
type View = 'SALES' | 'FINANCE';

// --- Define Component Props (UPDATED SalesActions Interface) ---
interface SalesActions {
    uploadLabel: string; // <-- Only two properties
    onUpload: () => void;
}

interface TransactionDashboardProps {
    view: View;
    setSalesActions?: (actions: SalesActions) => void;
}

// --- The Consolidated Component ---
export default function TransactionDashboard({ view, setSalesActions }: TransactionDashboardProps) {

    const { user, logout } = useAuth();

    if (!user) {
        return <div className="text-center py-12">Loading user data...</div>;
    }

    // --- 1. CORE DATA HOOK ---
    // This hook fetches the correct data based on the 'view' prop
    const {
        transactions, isLoading, currentPage, totalPages, setCurrentPage,
        apiError, setApiError,
        fetchTransactions,
    } = useTransactionDashboard({
        user,
        view,
        onLogout: logout
    });

    // --- 2. COMMON UI STATE ---
    // All filter/date state is now in one place
    const [filter, setFilter] = useState<string>('');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const createEmptyTransactionData = (): TransactionDetailResponse['data'] => ({
        transactions: {
            id: 0,
            clientName: '',
            salesman: user.username || '',
            submissionDate: new Date().toISOString(),
            ApprovalStatus: 'PENDING',
            MRC: 0,
            NRC: 0,
            mrc_currency: 'PEN',
            nrc_currency: 'PEN',
            plazoContrato: 12, // Default
            tipoCambio: 0,
            costoCapitalAnual: 0,
            costoInstalacion: 0,
            VAN: 0,
            TIR: 0,
            payback: 0,
            totalRevenue: 0,
            totalExpense: 0,
            grossMargin: 0,
            grossMarginRatio: 0,
            costoInstalacionRatio: 0,
            comisiones: 0,
            unidadNegocio: '', // This will show "Selecciona obligatorio"
            aplicaCartaFianza: false,
            tasaCartaFianza: 0,
            costoCartaFianza: 0,
        } as Transaction, // Cast to satisfy the type
        fixed_costs: [],
        recurring_services: [],
        timeline: {
            periods: [],
            revenues: { nrc: [], mrc: [] },
            expenses: { comisiones: [], egreso: [], fixed_costs: [] },
            net_cash_flow: []
        },
        fileName: "Nueva Plantilla"
    });

    // --- 3. VIEW-SPECIFIC MODAL STATE ---
    // Sales Modal State
    const [isUploaderPoppedUp, setIsUploaderPoppedUp] = useState<boolean>(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
    const [uploadedData, setUploadedData] = useState<TransactionDetailResponse['data'] | null>(null);

    // Finance Modal State
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailResponse['data'] | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

    // --- 4. COMMON HANDLERS (for filters) ---
    const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
    const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };

    // --- 5. VIEW-SPECIFIC HANDLERS ---

// Sales Handlers
    useEffect(() => {
        if (view === 'SALES' && setSalesActions) {
                setSalesActions({
                uploadLabel: 'Crear Plantilla',
                onUpload: () => {
                    setUploadedData(null); // Clear any previous data
                    setIsPreviewModalOpen(true); // Open the main modal
                },
            });
            // Cleanup function
            return () => {
                setSalesActions({
                    uploadLabel: 'Crear Plantilla', // Revert default
                    onUpload: () => console.log('Upload not yet available'),
                    // onExport is gone
                });
            };
        }
    }, [view, setSalesActions]);

    const handleUploadNext = async (file: File | null) => {
        if (!file) return;
        setApiError(null);
        const result = await uploadExcelForPreview(file);
        if (result.success && result.data) {
            setUploadedData(result.data); // Set the new data
            setIsUploaderPoppedUp(false); // Close the popup
        } else {
            // Show error in the popup
            alert(result.error || 'Unknown upload error');
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
        setIsUploaderPoppedUp(false); // Also close the popup
    };

    // Finance Handlers
    const handleRowClick = async (transaction: FormattedFinanceTx) => {
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
            setSelectedTransaction(result.data); // Re-set data to show commission changes
            fetchTransactions(currentPage); // Re-fetch list to update status/values
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const handleCloseFinanceModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTransaction(null);
    };

    // --- 6. COMMON & CONDITIONAL MEMOIZED LOGIC ---

    // Sales Stats
    const salesStats = useMemo(() => {
        const pendingApprovals = transactions.filter(t => t.status === 'PENDING').length;
        const totalValue = 0; // Placeholder logic
        const avgIRR = 24.5;  // Placeholder logic
        const avgPayback = 20; // Placeholder logic
        return {
            pendingApprovals,
            totalValue: `${(totalValue / 1000000).toFixed(2)}M`,
            avgIRR: `${avgIRR}%`,
            avgPayback: `${avgPayback} mo`,
        };
    }, [transactions]);

    // Finance Stats
    const financeStats = useMemo(() => {
        const transactionList = transactions as FormattedFinanceTx[];
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

    // Generalized Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const filterLower = filter.toLowerCase();
            
            // Handle different property names for client
            let clientMatch = false;
            if (view === 'SALES') {
                clientMatch = (t as FormattedSalesTransaction).client.toLowerCase().includes(filterLower);
            } else {
                clientMatch = (t as FormattedFinanceTx).clientName.toLowerCase().includes(filterLower);
            }

            // Common date logic
            if (!selectedDate) return clientMatch;
            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate, view]); // Added 'view' to dependency array


    // --- 7. CONDITIONAL RENDER ---
    return (
        <>
            <TransactionDashboardLayout
                apiError={apiError}
                placeholder={
                    view === 'SALES' 
                        ? "Filtra por nombre de cliente..." 
                        : "Filter by client name..."
                }
                statsGrid={
                    view === 'SALES' 
                        ? <SalesStatsGrid stats={salesStats} /> 
                        : <FinanceStatsGrid stats={financeStats} />
                }
                transactionList={
                    view === 'SALES' ? (
                        <SalesTransactionList
                            isLoading={isLoading}
                            transactions={filteredTransactions as FormattedSalesTransaction[]}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    ) : (
                        <FinanceTransactionList
                            isLoading={isLoading}
                            transactions={filteredTransactions as FormattedFinanceTx[]}
                            onRowClick={handleRowClick}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )
                }
                // Pass all common filter props
                filter={filter}
                setFilter={setFilter}
                isDatePickerOpen={isDatePickerOpen}
                setIsDatePickerOpen={setIsDatePickerOpen}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                datePickerRef={datePickerRef as RefObject<HTMLDivElement | null>}
                onClearDate={handleClearDate}
                onSelectToday={handleSelectToday}
            />

            {/* --- Conditional Sales Modals --- */}
            {view === 'SALES' && (
                <>
                    {/* The FileUploader is now a popup controlled by new state */}
                    <FileUploadModal 
                        isOpen={isUploaderPoppedUp} 
                        onClose={() => setIsUploaderPoppedUp(false)} 
                        onNext={handleUploadNext} 
                    />

                    {/* The Preview Modal now opens if EITHER it's empty OR has data */}
                    {isPreviewModalOpen && (
                        <TransactionPreviewProvider
                            // IMPORTANT: Use the uploaded data OR the new empty template
                            baseTransaction={uploadedData || createEmptyTransactionData()}
                            // Add a key to force re-render when uploadedData changes from null to something
                            key={(uploadedData?.fileName || 'empty') + (uploadedData?.transactions.id || '0')}
                            view="SALES"
                        >
                            <DataPreviewModal
                                isOpen={isPreviewModalOpen}
                                // Title is dynamic
                                title={uploadedData ? `Preview: ${uploadedData.fileName}` : "Nueva Plantilla"}
                                onClose={handleCloseSalesModal}
                                // Status is dynamic
                                status={(uploadedData || createEmptyTransactionData()).transactions.ApprovalStatus} 
                                // Pass the new "Cargar Excel" button to the header
                                headerActions={
                                    <button
                                        onClick={() => setIsUploaderPoppedUp(true)}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                                    >
                                        <UploadIcon className="w-4 h-4" />
                                        <span>Cargar Excel</span>
                                    </button>
                                }
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

            {/* --- Conditional Finance Modal --- */}
            {view === 'FINANCE' && selectedTransaction && (
                <TransactionPreviewProvider
                    baseTransaction={selectedTransaction}
                    view="FINANCE"
                >
                    <DataPreviewModal
                        isOpen={isDetailModalOpen}
                        title={`Transaction ID: ${selectedTransaction.transactions.transactionID || selectedTransaction.transactions.id}`}
                        onClose={handleCloseFinanceModal}
                        // Pass status for the new modal header structure (Point 2)
                        status={selectedTransaction.transactions.ApprovalStatus} 
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