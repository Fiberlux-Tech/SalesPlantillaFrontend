// src/features/sales/SalesDashboard.tsx
import { useState, useMemo, useEffect } from 'react';
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesToolbar } from './components/SalesToolBar';
import { SalesTransactionList } from './components/SalesTransactionList';
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

// Define the shape of the Gigalan inputs (kept local as part of Sales-specific UI flow)
interface GigalanInputs {
    gigalan_region: string;
    gigalan_sale_type: "NUEVO" | "EXISTENTE" | "";
    gigalan_old_mrc: number | null;
}

// Define the shape of the override fields (kept local as part of Sales-specific UI flow)
interface OverrideFields {
    plazoContrato: number | null;
    MRC: number | null;
    mrc_currency: "PEN" | "USD" | null;
    NRC: number | null;
    nrc_currency: "PEN" | "USD" | null;
}

export default function SalesDashboard({ user: _user, setSalesActions }: SalesDashboardProps) {
    // --- LOCAL SALES-SPECIFIC STATE ---
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false); 
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
    const [uploadedData, setUploadedData] = useState<TransactionDetailResponse['data'] | null>(null);
    const [selectedUnidad, setSelectedUnidad] = useState<string>('');
    const [gigalanCommissionInputs, setGigalanCommissionInputs] = useState<GigalanInputs>({
        gigalan_region: '', gigalan_sale_type: '', gigalan_old_mrc: null,
    });
    const [overrideFields, setOverrideFields] = useState<OverrideFields>({ 
        plazoContrato: null, MRC: null, mrc_currency: null, NRC: null, nrc_currency: null 
    });


    // --- HOOK CONSUMPTION ---
    const { 
        transactions, isLoading, currentPage, totalPages, setCurrentPage,
        filter, setFilter, isDatePickerOpen, setIsDatePickerOpen, selectedDate, setSelectedDate, datePickerRef, handleClearDate, handleSelectToday, filteredTransactions,
        apiError, setApiError, liveKpis, setLiveKpis,
        editedFixedCosts, setEditedFixedCosts, editedRecurringServices, setEditedRecurringServices,
        isCodeManagerOpen, setIsCodeManagerOpen,
        handleRecalculate, handleFixedCostAdd, handleFixedCostRemove,
        fetchTransactions,
    } = useTransactionDashboard({ user: _user, view: 'SALES', onLogout: () => {} });


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


    // --- stats calculation remains here ---
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


    // --- HANDLERS ---
    
    const handleInputChangeAndRecalculate = async (inputKey: string, inputValue: any) => {
        if (!uploadedData) return;
        setApiError(null);

        // Map local state changes back into the common input flow before calling the hook's handler
        if (inputKey === 'unidadNegocio') {
            setSelectedUnidad(inputValue);
        } else if (inputKey === 'fixed_costs') {
             setEditedFixedCosts(inputValue);
        } else if (inputKey === 'recurring_services') { 
             setEditedRecurringServices(inputValue);
        } else if (inputKey.startsWith('gigalan_')) {
             setGigalanCommissionInputs(prev => {
                const next = { ...prev, [inputKey]: inputValue };
                 if (inputKey === 'gigalan_sale_type' && inputValue !== 'EXISTENTE') {
                     next.gigalan_old_mrc = null;
                 }
                 return next;
             });
        } else if (['plazoContrato', 'MRC', 'NRC', 'mrc_currency', 'nrc_currency'].includes(inputKey)) {
             setOverrideFields(prev => ({ ...prev, [inputKey]: inputValue }));
        }

        // Call the unified hook logic, providing the base transaction data
        await handleRecalculate(inputKey, inputValue, uploadedData);
    };


    // Handles initial Excel upload and data setup
    const handleUploadNext = async (file: File | null) => {
        if (!file) return;
        setApiError(null);
        // Reset states
        setLiveKpis(null); 
        setEditedFixedCosts(null); 
        setEditedRecurringServices(null);
        setIsCodeManagerOpen(false); 
        
        // Reset local sales states
        setSelectedUnidad('');

        const result = await uploadExcelForPreview(file);

        if (result.success && result.data) {
            setUploadedData(result.data);
            setIsModalOpen(false);
            setIsPreviewModalOpen(true);

            setEditedFixedCosts(result.data.fixed_costs || []); 
            setEditedRecurringServices(result.data.recurring_services || []); 

            setOverrideFields({ 
                plazoContrato: result.data.transactions.plazoContrato, MRC: result.data.transactions.MRC, 
                mrc_currency: result.data.transactions.mrc_currency || 'PEN', 
                NRC: result.data.transactions.NRC, nrc_currency: result.data.transactions.nrc_currency || 'PEN'
            });
            setGigalanCommissionInputs({ gigalan_region: '', gigalan_sale_type: '', gigalan_old_mrc: null });
        } else {
            setApiError(result.error || 'Unknown upload error');
            setIsModalOpen(false);
        }
    };

    // Handles final transaction submission
    const handleConfirmSubmission = async () => {
        if (!uploadedData || !selectedUnidad) {
            setApiError('Por favor, selecciona una Unidad de Negocio.');
            return;
        }
        setApiError(null);
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
            fetchTransactions(); // Reload transactions list
            setIsPreviewModalOpen(false);
            setUploadedData(null);
            setSelectedUnidad('');
            setEditedFixedCosts(null); setEditedRecurringServices(null);
            setLiveKpis(null); 
            setIsCodeManagerOpen(false);
        } else {
            setApiError(result.error || 'Unknown submission error');
        }
    };
    
    // Wrapper for the Fixed Cost removal handler (Passes base data to hook)
    const handleFixedCostRemoveWrapper = (codeToRemove: string) => {
        if (!uploadedData) return;
        handleFixedCostRemove(codeToRemove, uploadedData);
    };

    // Wrapper for the Fixed Cost addition handler (Passes base data to hook)
    const handleFixedCostAddWrapper = (newCosts: FixedCost[]) => {
        if (!uploadedData) return;
        handleFixedCostAdd(newCosts, uploadedData);
    };
    
    // Handler for updates to Fixed Costs table within modal
    const handleFixedCostChange = (index: number, field: keyof FixedCost, value: string | number) => {
        if (!editedFixedCosts || !uploadedData) return;

        setEditedFixedCosts(prev => {
            const newCosts = [...(prev || [])];
            (newCosts[index] as any)[field] = value;
            handleRecalculate('fixed_costs', newCosts, uploadedData); // Pass base data here
            return newCosts;
        });
    };
    
    // Handler for updates to Recurring Services table within modal
    const handleRecurringServiceChange = (index: number, field: keyof RecurringService, value: any) => {
        if (!editedRecurringServices || !uploadedData) return;

        setEditedRecurringServices(prev => {
            const newServices = [...(prev || [])];
            (newServices[index] as any)[field] = value; 
            handleRecalculate('recurring_services', newServices, uploadedData); // Pass base data here
            return newServices;
        });
    };
    

    // --- RENDER ---
    return (
        <>
            <div className="container mx-auto px-8 py-8">
            <SalesStatsGrid stats={stats} />
                <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                    <SalesToolbar
                        filter={filter} setFilter={setFilter}
                        isDatePickerOpen={isDatePickerOpen} setIsDatePickerOpen={setIsDatePickerOpen}
                        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                        datePickerRef={datePickerRef}
                        onClearDate={handleClearDate} onSelectToday={handleSelectToday}
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
                        onGigalanInputChange={(inputKey, value) => handleInputChangeAndRecalculate(inputKey, value)}
                        selectedUnidad={selectedUnidad}
                        onUnidadChange={(value) => handleInputChangeAndRecalculate('unidadNegocio', value)}
                        fixedCostsData={editedFixedCosts} 
                        onFixedCostChange={handleFixedCostChange}
                        recurringServicesData={editedRecurringServices}
                        onRecurringServiceChange={handleRecurringServiceChange}
                        // HOOK-BASED PROPS
                        isCodeManagerOpen={isCodeManagerOpen}
                        setIsCodeManagerOpen={setIsCodeManagerOpen}
                        onFixedCostAdd={handleFixedCostAddWrapper}
                        onFixedCostRemove={handleFixedCostRemoveWrapper}
                    />
                </DataPreviewModal>
            )}
        </>
    );
}