// src/features/sales/SalesDashboard.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesToolbar } from './components/SalesToolBar';
import { SalesTransactionList } from './components/SalesTransactionList';
import FileUploadModal from './components/FileUploadModal';
import DataPreviewModal from '../../components/shared/DataPreviewModal';
import { TransactionPreviewContent } from '../transactions/components/TransactionPreviewContent'; 
import { SalesPreviewFooter } from './components/SalesPreviewFooter'; 
import { 
    getSalesTransactions, 
    uploadExcelForPreview, 
    submitFinalTransaction, 
    calculatePreview,
    FormattedSalesTransaction // Import our new local type
} from './salesService'; 

// Import all the new types
import type { 
    User, 
    TransactionDetailResponse, 
    KpiCalculationResponse,
    FixedCost,
    RecurringService 
} from '@/types';

// Define props for the dashboard
interface SalesDashboardProps {
    user: User;
    setSalesActions: (actions: { onUpload: () => void, onExport: () => void }) => void;
}

// Define the shape of the Gigalan inputs
interface GigalanInputs {
    gigalan_region: string;
    gigalan_sale_type: "NUEVO" | "EXISTENTE" | "";
    gigalan_old_mrc: number | null;
}

// Define the shape of the override fields
interface OverrideFields {
    plazoContrato: number | null;
    MRC: number | null;
    mrc_currency: "PEN" | "USD" | null;
    NRC: number | null;
    nrc_currency: "PEN" | "USD" | null;
}

export default function SalesDashboard({ user: _user, setSalesActions }: SalesDashboardProps) {
    // --- STATE IS NOW TYPED ---
    const [transactions, setTransactions] = useState<FormattedSalesTransaction[]>([]);
    const [filter, setFilter] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
    const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const datePickerRef = useRef<HTMLDivElement>(null); // Type the ref
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
    const [uploadedData, setUploadedData] = useState<TransactionDetailResponse['data'] | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [gigalanCommissionInputs, setGigalanCommissionInputs] = useState<GigalanInputs>({
        gigalan_region: '',
        gigalan_sale_type: '',
        gigalan_old_mrc: null,
    });
    const [selectedUnidad, setSelectedUnidad] = useState<string>('');
    const [liveKpis, setLiveKpis] = useState<KpiCalculationResponse['data'] | null>(null);
    const [overrideFields, setOverrideFields] = useState<OverrideFields>({ 
        plazoContrato: null, 
        MRC: null, 
        mrc_currency: null,
        NRC: null,
        nrc_currency: null 
    });
    const [editedFixedCosts, setEditedFixedCosts] = useState<FixedCost[] | null>(null);
    const [editedRecurringServices, setEditedRecurringServices] = useState<RecurringService[] | null>(null);
    const [isCodeManagerOpen, setIsCodeManagerOpen] = useState<boolean>(false); // <-- NEW

    // --- useEffect for setSalesActions remains the same ---
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

    const fetchTransactions = async () => {
        setIsLoading(true);
        setApiError(null);
        const result = await getSalesTransactions(currentPage);

        if (result.success && result.data) {
            setTransactions(result.data);
            setTotalPages(result.pages || 1);
        } else {
            setApiError(result.error || 'Unknown error');
        }
        setIsLoading(false);
    };

    // --- NEW HANDLER ---
    const handleFixedCostAdd = (newCosts: FixedCost[]) => {
        if (!editedFixedCosts) return;

        // 1. Merge the new costs with the existing ones
        const combinedCosts = [...editedFixedCosts, ...newCosts];
        
        // 2. Update state and trigger recalculation
        setEditedFixedCosts(combinedCosts);
        handleInputChangeAndRecalculate('fixed_costs', combinedCosts);
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    // ... (stats and filteredTransactions logic remains the same)
    const stats = useMemo(() => {
        const pendingApprovals = transactions.filter(t => t.status === 'PENDING').length;
        const totalValue = 0; // This logic was a placeholder, needs to be fixed if (tx.totalValue) is real
        const avgIRR = 24.5;
        const avgPayback = 20;
        return {
            pendingApprovals,
            totalValue: `${(totalValue / 1000000).toFixed(2)}M`,
            avgIRR: `${avgIRR}%`,
            avgPayback: `${avgPayback} mo`,
        };
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const clientMatch = t.client.toLowerCase().includes(filter.toLowerCase());
            if (!selectedDate) return clientMatch;
            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);


    // --- HANDLERS (Now with stricter types) ---
    const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
    const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };


    const handleUploadNext = async (file: File | null) => {
        if (!file) return;
        setApiError(null);
        setLiveKpis(null);
        setEditedFixedCosts(null); 
        setEditedRecurringServices(null);
        setSelectedUnidad('');

        const result = await uploadExcelForPreview(file);

        if (result.success && result.data) {
            setUploadedData(result.data);
            setIsModalOpen(false);
            setIsPreviewModalOpen(true);

            setEditedFixedCosts(result.data.fixed_costs || []); 
            setEditedRecurringServices(result.data.recurring_services || []); 

            setOverrideFields({ 
                plazoContrato: result.data.transactions.plazoContrato,
                MRC: result.data.transactions.MRC,
                mrc_currency: result.data.transactions.mrc_currency || 'PEN',
                NRC: result.data.transactions.NRC,
                nrc_currency: result.data.transactions.nrc_currency || 'PEN'
            });
            
            setGigalanCommissionInputs({
                gigalan_region: '',
                gigalan_sale_type: '',
                gigalan_old_mrc: null,
            });
        } else {
            setApiError(result.error || 'Unknown upload error');
            setIsModalOpen(false);
        }
    };

    const handleConfirmSubmission = async () => {
        // ... (All validation logic remains the same) ...
        if (!uploadedData) return;
        setApiError(null);

        if (!selectedUnidad) {
            setApiError('Por favor, selecciona una Unidad de Negocio.');
            return;
        }
        // ... (rest of validation) ...

        const finalPayload = {
            ...uploadedData,
            fixed_costs: editedFixedCosts, 
            recurring_services: editedRecurringServices,
            transactions: {
                ...uploadedData.transactions,
                ...gigalanCommissionInputs,
                unidadNegocio: selectedUnidad,
                ...overrideFields 
            }
        };

        delete (finalPayload as any).timeline;

        const result = await submitFinalTransaction(finalPayload);

        if (result.success) {
            fetchTransactions();
            setIsPreviewModalOpen(false);
            setUploadedData(null);
            setSelectedUnidad('');
            setEditedFixedCosts(null); 
            setEditedRecurringServices(null);
            setLiveKpis(null); 
        } else {
            setApiError(result.error || 'Unknown submission error');
        }
    };

    // --- Typed Handlers ---
    const handleRecurringServiceChange = (index: number, field: keyof RecurringService, value: any) => {
        if (!editedRecurringServices) return;

        const newServices = [...editedRecurringServices];
        // This is a bit of a hack for typing, a reducer would be cleaner
        (newServices[index] as any)[field] = value; 
        
        setEditedRecurringServices(newServices);
        handleInputChangeAndRecalculate('recurring_services', newServices);
    };

    const handleFixedCostChange = (index: number, field: keyof FixedCost, value: string | number) => {
        if (!editedFixedCosts) return;

        const newCosts = [...editedFixedCosts];
        (newCosts[index] as any)[field] = value;
        
        setEditedFixedCosts(newCosts);
        handleInputChangeAndRecalculate('fixed_costs', newCosts);
    };

    const handleInputChangeAndRecalculate = async (inputKey: string, inputValue: any) => {
        if (!uploadedData) return;
        setApiError(null);

        let nextUnidad = selectedUnidad;
        let nextGigalanInputs = { ...gigalanCommissionInputs };
        let nextOverrideFields = { ...overrideFields };
        
        let costsForPayload = editedFixedCosts; 
        let servicesForPayload = editedRecurringServices; 

        if (inputKey === 'unidadNegocio') {
            nextUnidad = inputValue as string;
            if (inputValue !== 'GIGALAN') {
                nextGigalanInputs = { gigalan_region: '', gigalan_sale_type: '', gigalan_old_mrc: null };
            }
        } else if (inputKey.startsWith('gigalan_')) {
            (nextGigalanInputs as any)[inputKey] = inputValue;
            if (inputKey === 'gigalan_sale_type' && inputValue !== 'EXISTENTE') {
                nextGigalanInputs.gigalan_old_mrc = null;
            }
        } else if (['plazoContrato', 'MRC', 'NRC', 'mrc_currency', 'nrc_currency'].includes(inputKey)) {
            (nextOverrideFields as any)[inputKey] = inputValue; 
        } else if (inputKey === 'fixed_costs') {
            costsForPayload = inputValue as FixedCost[]; 
        } else if (inputKey === 'recurring_services') { 
            servicesForPayload = inputValue as RecurringService[];
        }

        setSelectedUnidad(nextUnidad);
        setGigalanCommissionInputs(nextGigalanInputs);
        setOverrideFields(nextOverrideFields);

        const payload = {
            ...uploadedData,
            fixed_costs: costsForPayload, 
            recurring_services: servicesForPayload,
            transactions: {
                ...uploadedData.transactions,
                unidadNegocio: nextUnidad,
                ...nextGigalanInputs,
                ...nextOverrideFields
            }
        };

        delete (payload as any).timeline;

        try {
            const result = await calculatePreview(payload);
            if (result.success) {
                setLiveKpis(result.data || null);
            } else {
                setApiError(result.error || 'Failed to update KPIs.');
                setLiveKpis(null);
            }
        } catch (error: any) {
            setApiError(error.message || 'Network error calculating preview.');
            setLiveKpis(null);
        } 
    };

    // --- RENDER (no changes, just type-safe) ---
   return (
        <>
            <div className="container mx-auto px-8 py-8">
            <SalesStatsGrid stats={stats} />
            <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                <SalesToolbar
                    filter={filter}
                    setFilter={setFilter}
                    isDatePickerOpen={isDatePickerOpen}
                    setIsDatePickerOpen={setIsDatePickerOpen}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    datePickerRef={datePickerRef}
                    onClearDate={handleClearDate}
                    onSelectToday={handleSelectToday}
                />
                <SalesTransactionList
                    isLoading={isLoading}
                    transactions={filteredTransactions}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
          .</div>
            </div>

            {/* Modals */}
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            <FileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNext={handleUploadNext} />
            
            {uploadedData && (
                <DataPreviewModal
                    isOpen={isPreviewModalOpen}
                    title={`Preview: ${uploadedData.fileName}`}
                    onClose={() => { setIsPreviewModalOpen(false); setSelectedUnidad(''); setLiveKpis(null); setIsCodeManagerOpen(false); }} 
                    footer={
                        <SalesPreviewFooter 
                            onConfirm={handleConfirmSubmission} 
                            onClose={() => { setIsPreviewModalOpen(false); setSelectedUnidad(''); setLiveKpis(null); setIsCodeManagerOpen(false); }} 
                        />
                    }
                >
                    <TransactionPreviewContent
                        isFinanceView={false}
                        data={uploadedData}
                        liveKpis={liveKpis}
                        gigalanInputs={{...gigalanCommissionInputs, ...overrideFields}}
                        onGigalanInputChange={handleInputChangeAndRecalculate}
                        selectedUnidad={selectedUnidad}
                        onUnidadChange={(value) => handleInputChangeAndRecalculate('unidadNegocio', value)}
                        fixedCostsData={editedFixedCosts} 
                        onFixedCostChange={handleFixedCostChange}
                        recurringServicesData={editedRecurringServices}
                        onRecurringServiceChange={handleRecurringServiceChange}
                        // **NEW PROPS**
                        isCodeManagerOpen={isCodeManagerOpen}
                        setIsCodeManagerOpen={setIsCodeManagerOpen}
                        onFixedCostAdd={handleFixedCostAdd}
                    />
                </DataPreviewModal>
            )}
        </>
    );
}