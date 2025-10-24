// src/features/sales/SalesDashboard.jsx (Refactored with Unidad de Negocio state)

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesToolbar } from './components/SalesToolBar';
import { SalesTransactionList } from './components/SalesTransactionList';
import FileUploadModal from './components/FileUploadModal';
import DataPreviewModal from '../../components/shared/DataPreviewModal';
import { UploadIcon, ExportIcon } from '../../components/shared/Icons';
// Import the new Service Layer
import { getSalesTransactions, uploadExcelForPreview, submitFinalTransaction, calculatePreview } from './salesService'; // Add calculatePreview

export default function SalesDashboard({ onLogout }) {
    // --- ALL STATE REMAINS HERE ---
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const datePickerRef = useRef(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [uploadedData, setUploadedData] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [gigalanCommissionInputs, setGigalanCommissionInputs] = useState({
        gigalan_region: '',
        gigalan_sale_type: '',
        gigalan_old_mrc: null,
    });
    // --- ADDED STATE ---
    const [selectedUnidad, setSelectedUnidad] = useState('');
    const [liveKpis, setLiveKpis] = useState(null);
    // NEW: State for editable MRC, NRC, Plazo Contrato
    const [overrideFields, setOverrideFields] = useState({ 
        plazoContrato: null, 
        MRC: null, 
        NRC: null 
    });

    // --- DATA FETCHING (CLEANED UP) ---
    const fetchTransactions = async () => {
        setIsLoading(true);
        setApiError(null);

        // Use the service function
        const result = await getSalesTransactions(currentPage);

        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) {
            setTransactions(result.data); // Data is already formatted
            setTotalPages(result.pages);
        } else {
            setApiError(result.error);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    // ... (stats and filteredTransactions logic remain the same, relying on local state) ...
    const stats = useMemo(() => {
        // ... your stats logic
        const pendingApprovals = transactions.filter(t => t.status === 'PENDING').length;
        const totalValue = transactions.reduce((acc, t) => acc + (t.totalValue || 0), 0);
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
        // ... your filter logic
        return transactions.filter(t => {
            const clientMatch = t.client.toLowerCase().includes(filter.toLowerCase());
            if (!selectedDate) return clientMatch;
            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);

    // ... (handleClickOutside and date handlers remain the same) ...


    // --- HANDLERS (CLEANED UP) ---
    const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
    const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };

    const handleGigalanInputChange = (key, value) => {
        setGigalanCommissionInputs(prev => {
            const newState = { ...prev, [key]: value };
            if (key === 'gigalan_sale_type' && value !== 'EXISTENTE') {
                newState.gigalan_old_mrc = null;
            }
            return newState;
        });
    };

    const handleUploadNext = async (file) => {
        if (!file) return;
        setApiError(null);

        // Use the service function
        const result = await uploadExcelForPreview(file);

        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) {
            setUploadedData(result.data); // Data is now guaranteed to have fileName
            setIsModalOpen(false);
            setIsPreviewModalOpen(true);
            setSelectedUnidad('');
            setLiveKpis(null); // Reset live KPIs for new preview

            // NEW: Initialize override fields from the original uploaded data
            setOverrideFields({ 
                plazoContrato: result.data.transactions.plazoContrato,
                MRC: result.data.transactions.MRC,
                NRC: result.data.transactions.NRC,
            });

            setGigalanCommissionInputs({
                gigalan_region: '',
                gigalan_sale_type: '',
                gigalan_old_mrc: null,
            });
        } else {
            setApiError(result.error);
            setIsModalOpen(false);
        }
    };

    const handleConfirmSubmission = async () => {
        if (!uploadedData) return;
        setApiError(null);

        // --- ADDED VALIDATION ---
        if (!selectedUnidad) {
            setApiError('Por favor, selecciona una Unidad de Negocio.');
            return;
        }

        // --- VALIDATION: Logic remains here, using selectedUnidad ---
        if (selectedUnidad === 'GIGALAN') { // <-- MODIFIED: Use selectedUnidad
            if (!gigalanCommissionInputs.gigalan_region || !gigalanCommissionInputs.gigalan_sale_type) {
                setApiError('GIGALAN transactions require Region and Type of Sale to be selected.');
                return;
            }
            if (gigalanCommissionInputs.gigalan_sale_type === 'EXISTENTE' && (!gigalanCommissionInputs.gigalan_old_mrc || gigalanCommissionInputs.gigalan_old_mrc <= 0)) {
                setApiError('GIGALAN Existing Sales require a valid Previous Monthly Charge amount.');
                return;
            }
        }

        // --- PREPARE FINAL PAYLOAD: MODIFIED to use selectedUnidad and overrideFields ---
        const finalPayload = {
            ...uploadedData,
            transactions: {
                ...uploadedData.transactions,
                ...gigalanCommissionInputs,
                unidadNegocio: selectedUnidad, // <-- THIS IS THE KEY CHANGE
                ...overrideFields // <-- NEW: Include all overrides in final submission
            }
        };

        // Use the service function
        const result = await submitFinalTransaction(finalPayload);

        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) {
            fetchTransactions();
            setIsPreviewModalOpen(false);
            setUploadedData(null);
            setSelectedUnidad(''); // Reset after successful submission
        } else {
            setApiError(result.error);
        }
    };

    const handleInputChangeAndRecalculate = async (inputKey, inputValue) => {
        if (!uploadedData) return; // Should not happen if modal is open, but safe check

        setApiError(null); // Clear previous errors

        // 1. Determine which state to update and prepare the next state values
        let nextUnidad = selectedUnidad;
        let nextGigalanInputs = { ...gigalanCommissionInputs };
        let nextOverrideFields = { ...overrideFields }; // <--- NEW

        // Default to the value from the originally uploaded data (no longer needed here, handled by overrideFields)

        // A. Handle Unidad
        if (inputKey === 'unidadNegocio') {
            nextUnidad = inputValue;
            // Reset Gigalan inputs if Unidad changes away from GIGALAN
            if (inputValue !== 'GIGALAN') {
                nextGigalanInputs = { gigalan_region: '', gigalan_sale_type: '', gigalan_old_mrc: null };
            }
        // B. Handle Gigalan inputs
        } else if (inputKey.startsWith('gigalan_')) {
            nextGigalanInputs[inputKey] = inputValue;
            // Handle dependent reset for gigalan_old_mrc
            if (inputKey === 'gigalan_sale_type' && inputValue !== 'EXISTENTE') {
                nextGigalanInputs.gigalan_old_mrc = null;
            }
        // C. Handle top-level editable fields (Plazo Contrato, MRC, NRC)
        } else if (['plazoContrato', 'MRC', 'NRC'].includes(inputKey)) {
             nextOverrideFields[inputKey] = inputValue; 
        }

        // 2. Update the state visually *immediately*
        setSelectedUnidad(nextUnidad);
        setGigalanCommissionInputs(nextGigalanInputs);
        setOverrideFields(nextOverrideFields); // <--- NEW

        // 3. Prepare the payload for the backend (using the *next* state values)
        const payload = {
            ...uploadedData, // Includes original fixed_costs, recurring_services
            transactions: {
                ...uploadedData.transactions, // Includes original clientName, MRC, NRC etc.
                // --- Override with current/next input values ---
                unidadNegocio: nextUnidad,
                ...nextGigalanInputs, // Spread the updated Gigalan inputs
                ...nextOverrideFields // <-- CRITICAL FIX: Spread the overrides for MRC, NRC, Plazo Contrato
            }
        };

        // 4. Call the backend preview calculation
        try {
            // Set loading state if desired (optional, for visual feedback)
            // setIsLoading(true); // Maybe use a different loading state for KPIs?

            const result = await calculatePreview(payload);

            if (result.status === 401) {
                onLogout();
                return;
            }

            if (result.success) {
                setLiveKpis(result.data); // Update the live KPI state
            } else {
                setApiError(result.error || 'Failed to update KPIs.');
                setLiveKpis(null); // Clear KPIs on error maybe? Or leave stale? Decide UX.
            }
        } catch (error) {
            setApiError('Network error calculating preview.');
            setLiveKpis(null); // Clear KPIs on error
        } finally {
            // setIsLoading(false); // Reset loading state
        }
    };

    // --- CLEAN RENDER METHOD (No change needed) ---
    return (
        <>
            <div className="container mx-auto px-8 py-8">
            {/* Header stays here as it's simple */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Plantillas Economicas</h1>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"><ExportIcon /><span>Export</span></button>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg shadow-sm hover:bg-gray-800"><UploadIcon /><span>Upload File</span></button>
                </div>
            </header>

            {/* 1. Render the Stats Grid Component */}
            <SalesStatsGrid stats={stats} />

            <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                {/* 2. Render the Toolbar Component */}
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

                {/* 3. Render the Transaction List Component */}
                <SalesTransactionList
                    isLoading={isLoading}
                    transactions={filteredTransactions}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
            </div>

            {/* Modals stay here, controlled by the parent */}
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            <FileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNext={handleUploadNext} />
            <DataPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => { setIsPreviewModalOpen(false); setSelectedUnidad(''); setLiveKpis(null); }} // Reset KPIs on close
                onConfirm={handleConfirmSubmission}
                data={uploadedData}
                liveKpis={liveKpis} // Pass the live KPI results

                gigalanInputs={gigalanCommissionInputs}
                onGigalanInputChange={(key, value) => handleInputChangeAndRecalculate(key, value)} // Use new handler for all inputs
                // --- ADDED PROPS ---
                selectedUnidad={selectedUnidad}
                onUnidadChange={(value) => handleInputChangeAndRecalculate('unidadNegocio', value)} // Use new handler
            />
        </>
    );
}