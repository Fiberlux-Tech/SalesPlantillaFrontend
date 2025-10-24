// src/features/sales/SalesDashboard.jsx (Refactored with Unidad de Negocio state)

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesToolbar } from './components/SalesToolBar';
import { SalesTransactionList } from './components/SalesTransactionList';
import FileUploadModal from './components/FileUploadModal';
import DataPreviewModal from '../../components/shared/DataPreviewModal';
import { UploadIcon, ExportIcon } from '../../components/shared/Icons';
// Import the new Service Layer
import { getSalesTransactions, uploadExcelForPreview, submitFinalTransaction, calculatePreview } from './salesService'; 

export default function SalesDashboard({ onLogout }) {
    // --- ALL STATE REMAINS HERE ---
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const datePickerRef = useRef(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    // uploadedData is the single source of truth for the entire transaction package
    const [uploadedData, setUploadedData] = useState(null); 
    const [apiError, setApiError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    // gigalanCommissionInputs is now deprecated and removed, as its data is now merged into uploadedData.transactions
    
    // --- ADDED STATE (Kept only what's absolutely necessary for UI/Recalc) ---
    // We use this to manage the display of the Unit dropdown until recalculation is triggered.
    const [selectedUnidad, setSelectedUnidad] = useState(''); 
    const [liveKpis, setLiveKpis] = useState(null);

    // --- DATA FETCHING ---
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

    // ... (stats and filteredTransactions logic remain the same, relying on local state) ...
    const stats = useMemo(() => {
        const pendingApprovals = transactions.filter(t => t.status === 'PENDING').length;
        const totalValue = transactions.reduce((acc, t) => acc + (t.totalRevenue || 0), 0); // Corrected to use totalRevenue for better metric
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

    // REMOVED: handleGigalanInputChange is removed.

    const handleUploadNext = async (file) => {
        if (!file) return;
        setApiError(null);

        const result = await uploadExcelForPreview(file);

        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) {
            setUploadedData(result.data); // This is the new source of truth
            setIsModalOpen(false);
            setIsPreviewModalOpen(true);
            
            // Set initial UI state from the uploaded data (for display purposes)
            const initialTx = result.data.transactions;
            setSelectedUnidad(initialTx.unidadNegocio || '');
            setLiveKpis(null); // Reset live KPIs for new preview
        } else {
            setApiError(result.error);
            setIsModalOpen(false);
        }
    };

    const handleConfirmSubmission = async () => {
        if (!uploadedData) return;
        setApiError(null);

        // Use the **latest** state for validation
        const currentTx = uploadedData.transactions; 

        // --- VALIDATION: Uses currentTx (the single source of truth) ---
        if (!currentTx.unidadNegocio) { 
            setApiError('Por favor, selecciona una Unidad de Negocio.');
            return;
        }

        if (currentTx.unidadNegocio === 'GIGALAN') { 
            if (!currentTx.gigalan_region || !currentTx.gigalan_sale_type) {
                setApiError('GIGALAN transactions require Region and Type of Sale to be selected.');
                return;
            }
            // Check for valid old_mrc if sale type is EXISTENTE
            if (currentTx.gigalan_sale_type === 'EXISTENTE' && (currentTx.gigalan_old_mrc === null || currentTx.gigalan_old_mrc <= 0)) {
                setApiError('GIGALAN Existing Sales require a valid Previous Monthly Charge amount.');
                return;
            }
        }

        // --- PAYLOAD: Use uploadedData directly, as it contains all persisted edits ---
        const finalPayload = uploadedData;

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
        } else {
            setApiError(result.error);
        }
    };

    // --- REFACTORED: Single handler for all editable transaction data fields ---
    const handleDataChangeAndRecalculate = async (inputKey, inputValue) => {
        if (!uploadedData) return;

        setApiError(null);

        // 1. Create a mutable copy of the transactions payload for persistence and calculation
        let nextTransactions = { ...uploadedData.transactions }; 

        // 2. Update the core data and local UI states
        if (inputKey === 'unidadNegocio') {
            nextTransactions.unidadNegocio = inputValue;
            setSelectedUnidad(inputValue); // Update UI state for display purpose
            
            // If switching away from GIGALAN, clear the dependent fields in the payload
            if (inputValue !== 'GIGALAN') {
                nextTransactions.gigalan_region = '';
                nextTransactions.gigalan_sale_type = '';
                nextTransactions.gigalan_old_mrc = null;
            }
        } 
        // Handles Plazo, MRC, NRC, Region, SaleType, and OldMRC (all stored inside transactions object)
        else if (nextTransactions.hasOwnProperty(inputKey) || inputKey.startsWith('gigalan_') || inputKey === 'MRC' || inputKey === 'NRC' || inputKey === 'plazoContrato') { 
             nextTransactions[inputKey] = inputValue;

            // Handle dependent reset for gigalan_old_mrc if sale type changes
            if (inputKey === 'gigalan_sale_type' && inputValue !== 'EXISTENTE') {
                 nextTransactions.gigalan_old_mrc = null;
            }
        } else {
            // Safety break if an unhandled key is passed
            console.warn(`Attempted to update unknown key: ${inputKey}`);
            return;
        }
        
        // 3. Persist the change to the main state and set payload
        const nextUploadedData = {
            ...uploadedData, 
            transactions: nextTransactions
        };
        setUploadedData(nextUploadedData);
        
        // 4. Call the backend preview calculation
        try {
            const result = await calculatePreview(nextUploadedData); 

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

    // --- CLEAN RENDER METHOD ---
    return (
        <>
            <div className="container mx-auto px-8 py-8">
            {/* Header stays here as it's simple */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Deal Approval Portal</h1>
                    <p className="text-gray-500 mt-1">Submit and track your deal proposals</p>
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
                onClose={() => { setIsPreviewModalOpen(false); setSelectedUnidad(''); setLiveKpis(null); }} 
                onConfirm={handleConfirmSubmission}
                data={uploadedData}
                liveKpis={liveKpis} 

                // --- UPDATED PROPS ---
                // Pass the current transaction object (which includes all editable fields)
                gigalanInputs={uploadedData?.transactions} 
                // Use the single handler for all input changes
                onInputChangeAndRecalculate={handleDataChangeAndRecalculate} 
                // Keep selectedUnidad for the initial display logic within the modal
                selectedUnidad={selectedUnidad} 
            />
        </>
    );
}