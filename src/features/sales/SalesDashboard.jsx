// src/features/sales/SalesDashboard.jsx (Final Corrected Version)

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesToolbar } from './components/SalesToolBar';
import { SalesTransactionList } from './components/SalesTransactionList';
import FileUploadModal from './components/FileUploadModal';
import DataPreviewModal from '../../components/shared/DataPreviewModal';
import { UploadIcon, ExportIcon } from '../../components/shared/Icons';
import { getSalesTransactions, uploadExcelForPreview, submitFinalTransaction, calculatePreview } from './salesService'; 

// CORRECTED PROPS: Accepts user and setSalesActions
export default function SalesDashboard({ onLogout, user, setSalesActions }) { 
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
    const [overrideFields, setOverrideFields] = useState({ 
        plazoContrato: null, 
        MRC: null, 
        NRC: null 
    });
    const [editedFixedCosts, setEditedFixedCosts] = useState(null);

    // --- NEW: Register Handlers with App.jsx (GlobalHeader) ---
    useEffect(() => {
        // Only run if setSalesActions is available (when SalesDashboard is mounted)
        if (setSalesActions) {
            setSalesActions({
                onUpload: () => setIsModalOpen(true),
                onExport: () => alert('Exporting sales data is not implemented yet!') 
            });
            
            // Cleanup function
            return () => {
                setSalesActions({ 
                    onUpload: () => console.log('Upload not yet available'), 
                    onExport: () => console.log('Export not yet available') 
                });
            };
        }
    }, [setSalesActions]);


    // --- DATA FETCHING (CLEANED UP) ---
    const fetchTransactions = async () => {
        setIsLoading(true);
        setApiError(null);

        const result = await getSalesTransactions(currentPage);

        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) {
            setTransactions(result.data);
            setTotalPages(result.pages);
        } else {
            setApiError(result.error);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    // ... (stats and filteredTransactions logic) ...
    const stats = useMemo(() => {
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
        return transactions.filter(t => {
            const clientMatch = t.client.toLowerCase().includes(filter.toLowerCase());
            if (!selectedDate) return clientMatch;
            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);


    // --- HANDLERS ---
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

        // Reset all live states
        setLiveKpis(null);
        setEditedFixedCosts(null); // NEW
        setSelectedUnidad('');

        const result = await uploadExcelForPreview(file);

        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) {
            setUploadedData(result.data);
            setIsModalOpen(false);
            setIsPreviewModalOpen(true);

            // NEW: Initialize the editable fixed costs state
            setEditedFixedCosts(result.data.fixed_costs || []); 

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

        if (!selectedUnidad) {
            setApiError('Por favor, selecciona una Unidad de Negocio.');
            return;
        }

        if (selectedUnidad === 'GIGALAN') {
            if (!gigalanCommissionInputs.gigalan_region || !gigalanCommissionInputs.gigalan_sale_type) {
                setApiError('GIGALAN transactions require Region and Type of Sale to be selected.');
                return;
            }
            if (gigalanCommissionInputs.gigalan_sale_type === 'EXISTENTE' && (!gigalanCommissionInputs.gigalan_old_mrc || gigalanCommissionInputs.gigalan_old_mrc <= 0)) {
                setApiError('GIGALAN Existing Sales require a valid Previous Monthly Charge amount.');
                return;
            }
        }

        const finalPayload = {
            ...uploadedData,
            // NEW: Send the *edited* fixed costs array
            fixed_costs: editedFixedCosts, 
            recurring_services: uploadedData.recurring_services,
            transactions: {
                ...uploadedData.transactions,
                ...gigalanCommissionInputs,
                unidadNegocio: selectedUnidad,
                ...overrideFields 
            }
        };

        // Clean up response-only keys before sending
        delete finalPayload.timeline;

        const result = await submitFinalTransaction(finalPayload);

        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) {
            fetchTransactions();
            setIsPreviewModalOpen(false);
            setUploadedData(null);
            setSelectedUnidad('');
            setEditedFixedCosts(null); // NEW: Reset state
            setLiveKpis(null); // NEW: Reset state
        } else {
            setApiError(result.error);
        }
    };

    const handleFixedCostChange = (index, field, value) => {
        if (!editedFixedCosts) return;

        const newCosts = [...editedFixedCosts];
        newCosts[index] = { ...newCosts[index], [field]: value };
        
        // 1. Set the new array to state
        setEditedFixedCosts(newCosts);
        
        // 2. Trigger recalculation, passing a special key and the *new* costs array
        handleInputChangeAndRecalculate('fixed_costs', newCosts);
    };

    const handleInputChangeAndRecalculate = async (inputKey, inputValue) => {
        if (!uploadedData) return;

        setApiError(null);

        let nextUnidad = selectedUnidad;
        let nextGigalanInputs = { ...gigalanCommissionInputs };
        let nextOverrideFields = { ...overrideFields };
        
        // NEW: Use a variable to hold the fixed costs for the payload
        let costsForPayload = editedFixedCosts; 

        if (inputKey === 'unidadNegocio') {
            nextUnidad = inputValue;
            if (inputValue !== 'GIGALAN') {
                nextGigalanInputs = { gigalan_region: '', gigalan_sale_type: '', gigalan_old_mrc: null };
            }
        } else if (inputKey.startsWith('gigalan_')) {
            nextGigalanInputs[inputKey] = inputValue;
            if (inputKey === 'gigalan_sale_type' && inputValue !== 'EXISTENTE') {
                nextGigalanInputs.gigalan_old_mrc = null;
            }
        } else if (['plazoContrato', 'MRC', 'NRC'].includes(inputKey)) {
            nextOverrideFields[inputKey] = inputValue; 
        } else if (inputKey === 'fixed_costs') {
            // NEW: If the change *was* fixed costs, use the new value
            costsForPayload = inputValue;
        }

        // Update local state
        setSelectedUnidad(nextUnidad);
        setGigalanCommissionInputs(nextGigalanInputs);
        setOverrideFields(nextOverrideFields);

        // Build the *full* recalculation payload
        const payload = {
            ...uploadedData,
            // NEW: Pass the correct fixed costs array
            fixed_costs: costsForPayload, 
            recurring_services: uploadedData.recurring_services,
            transactions: {
                ...uploadedData.transactions,
                unidadNegocio: nextUnidad,
                ...nextGigalanInputs,
                ...nextOverrideFields
            }
        };

        // Clean up response-only keys before sending
        delete payload.timeline;

        // Call the service
        try {
            const result = await calculatePreview(payload);

            if (result.status === 401) {
                onLogout();
                return;
            }

            if (result.success) {
                setLiveKpis(result.data);
            } else {
                setApiError(result.error || 'Failed to update KPIs.');
                setLiveKpis(null);
            }
        } catch (error) {
            setApiError('Network error calculating preview.');
            setLiveKpis(null);
        } 
    };

    // --- RENDER ---
    return (
        <>
            <div className="container mx-auto px-8 py-8">
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

            {/* Modals stay here */}
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            <FileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onNext={handleUploadNext} />
            <DataPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => { setIsPreviewModalOpen(false); setSelectedUnidad(''); setLiveKpis(null); }} 
                onConfirm={handleConfirmSubmission}
                data={uploadedData}
                liveKpis={liveKpis}

                gigalanInputs={gigalanCommissionInputs}
                onGigalanInputChange={(key, value) => handleInputChangeAndRecalculate(key, value)}
                selectedUnidad={selectedUnidad}
                onUnidadChange={(value) => handleInputChangeAndRecalculate('unidadNegocio', value)}
                userRole={user.role}
                fixedCostsData={editedFixedCosts} // Pass the editable state
                onFixedCostChange={handleFixedCostChange} // Pass the new handler
            />
        </>
    );
}