// src/features/transactions/TransactionDashboard.tsx
import { useState, useMemo, useEffect, useRef, RefObject } from 'react';
import { UploadIcon } from '@/components/shared/Icons';

// --- Shared Imports ---
import DataPreviewModal from '@/features/transactions/components/DataPreviewModal';
import { TransactionPreviewProvider } from '@/contexts/TransactionPreviewContext';
import { useTransactionDashboard } from '@/hooks/useTransactionDashboard';
import { useAuth } from '@/contexts/AuthContext';
import type { Transaction, TransactionDetailResponse, FixedCost, RecurringService } from '@/types';
import { TransactionDashboardLayout } from './components/TransactionDashboardLayout';
import { TransactionPreviewContent } from './components/TransactionPreviewContent';
import { UI_LABELS, ERROR_MESSAGES } from '@/config';
import { getAllKpis, type KpiData } from './services/kpi.service';

// --- Sales-Specific Imports ---
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesTransactionList } from './components/SalesTransactionList';
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
        return <div className="text-center py-12">{UI_LABELS.LOADING_USER_DATA}</div>;
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
    const fileInputRef = useRef<HTMLInputElement>(null); // <-- ADD THIS LINE

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
        fileName: UI_LABELS.NUEVA_PLANTILLA
    });

    // --- 3. VIEW-SPECIFIC MODAL STATE ---
    // Sales Modal State
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
    const [uploadedData, setUploadedData] = useState<TransactionDetailResponse['data'] | null>(null);

    // Finance Modal State
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetailResponse['data'] | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

    // --- KPI STATE ---
    const [kpiData, setKpiData] = useState<KpiData | null>(null);
    const [, setIsLoadingKpis] = useState<boolean>(true);

    // --- 4. FETCH KPIs ON MOUNT ---
    useEffect(() => {
        const fetchKpis = async () => {
            setIsLoadingKpis(true);
            const result = await getAllKpis();
            if (result.success && result.data) {
                setKpiData(result.data);
            }
            setIsLoadingKpis(false);
        };

        fetchKpis();
    }, []);

    // --- 5. COMMON HANDLERS (for filters) ---
    const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
    const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };

    // --- 6. VIEW-SPECIFIC HANDLERS ---

    // Sales Handlers
    useEffect(() => {
        if (view === 'SALES' && setSalesActions) {
            setSalesActions({
                uploadLabel: UI_LABELS.CREATE_TEMPLATE,
                onUpload: () => {
                    setUploadedData(null); // Clear any previous data
                    setIsPreviewModalOpen(true); // Open the main modal
                },
            });
            // Cleanup function
            return () => {
                setSalesActions({
                    uploadLabel: UI_LABELS.CREATE_TEMPLATE, // Revert default
                    onUpload: () => console.log(UI_LABELS.UPLOAD_NOT_AVAILABLE),
                    // onExport is gone
                });
            };
        }
    }, [view, setSalesActions]);

    const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files[0]) {
            return; // No file selected
        }
        const file = event.target.files[0];

        setApiError(null);
        const result = await uploadExcelForPreview(file);
        if (result.success && result.data) {
            setUploadedData(result.data); // Set the new data
        } else {
            alert(result.error || ERROR_MESSAGES.UNKNOWN_UPLOAD_ERROR);
        }

        // Reset the input value so the user can upload the same file again
        if (event.target) {
            event.target.value = "";
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
            alert(result.error || ERROR_MESSAGES.UNKNOWN_SUBMISSION_ERROR);
        }
    };

    const handleCloseSalesModal = () => {
        setIsPreviewModalOpen(false);
        setUploadedData(null);
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
            setApiError(result.error || ERROR_MESSAGES.UNKNOWN_ERROR);
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
            alert(`${UI_LABELS.ERROR_PREFIX}${result.error}`);
        }
    };

    const handleCalculateCommission = async (transactionId: number) => {
        setApiError(null);
        const result = await calculateCommission(transactionId);
        if (result.success) {
            setSelectedTransaction(result.data); // Re-set data to show commission changes
            fetchTransactions(currentPage); // Re-fetch list to update status/values
        } else {
            alert(`${UI_LABELS.ERROR_PREFIX}${result.error}`);
        }
    };

    const handleCloseFinanceModal = () => {
        setIsDetailModalOpen(false);
        setSelectedTransaction(null);
    };

    // --- 7. COMMON & CONDITIONAL MEMOIZED LOGIC ---

    // Sales Stats - Using KPI data from API
    const salesStats = useMemo(() => {
        if (!kpiData) {
            // Return default values while loading
            return {
                pendingApprovals: 0,
                pendingMrc: 0,
                pendingComisiones: 0,
                avgGrossMargin: 0,
            };
        }

        return {
            pendingApprovals: kpiData.pendingCount,
            pendingMrc: kpiData.pendingMrc,
            pendingComisiones: kpiData.pendingComisiones,
            avgGrossMargin: kpiData.averageGrossMargin,
        };
    }, [kpiData]);

    // Finance Stats - Using KPI data from API
    const financeStats = useMemo(() => {
        if (!kpiData) {
            // Return default values while loading
            return {
                pendingMrc: 0,
                pendingCount: 0,
                pendingComisiones: 0,
                avgGrossMargin: 0,
            };
        }

        return {
            pendingMrc: kpiData.pendingMrc,
            pendingCount: kpiData.pendingCount,
            pendingComisiones: kpiData.pendingComisiones,
            avgGrossMargin: kpiData.averageGrossMargin,
        };
    }, [kpiData]);

    // Generalized Filter Logic
    const filteredTransactions = useMemo(() => {
        // Pre-compute selectedDate string if needed (outside the loop)
        const selectedDateString = selectedDate?.toDateString();

        return transactions.filter(t => {
            const filterLower = filter.toLowerCase();

            // Handle different property names for client
            let clientMatch = false;
            if (view === 'SALES') {
                clientMatch = (t as FormattedSalesTransaction).client.toLowerCase().includes(filterLower);
            } else {
                clientMatch = (t as FormattedFinanceTx).clientName.toLowerCase().includes(filterLower);
            }

            // Common date logic - only create Date object if we need to compare
            if (!selectedDateString) return clientMatch;

            // Create date without unnecessary string concatenation
            const transactionDate = new Date(t.submissionDate);
            return clientMatch && transactionDate.toDateString() === selectedDateString;
        });
    }, [transactions, filter, selectedDate, view]); // Added 'view' to dependency array


    // --- 8. CONDITIONAL RENDER ---
    return (
        <>
            <TransactionDashboardLayout
                apiError={apiError}
                placeholder={
                    view === 'SALES'
                        ? UI_LABELS.FILTRA_POR_CLIENTE
                        : UI_LABELS.FILTER_BY_CLIENT
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
                    {/* --- 1. ADD THE HIDDEN FILE INPUT --- */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelected}
                        className="hidden"
                        accept=".xlsx, .xls"
                    />
                    {/* --- 2. REMOVED the <FileUploadModal> --- */}

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
                                title={uploadedData ? UI_LABELS.PREVIEW_LABEL.replace('{fileName}', uploadedData.fileName || '') : UI_LABELS.NUEVA_PLANTILLA}
                                onClose={handleCloseSalesModal}
                                // Status is dynamic
                                status={(uploadedData || createEmptyTransactionData()).transactions.ApprovalStatus}
                                // --- 3. UPDATE THE BUTTON'S onClick ---
                                headerActions={
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
                                    >
                                        <UploadIcon className="w-4 h-4" />
                                        <span>{UI_LABELS.CARGAR_EXCEL}</span>
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
                        title={UI_LABELS.TRANSACTION_ID_LABEL.replace('{id}', String(selectedTransaction.transactions.transactionID || selectedTransaction.transactions.id))}
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