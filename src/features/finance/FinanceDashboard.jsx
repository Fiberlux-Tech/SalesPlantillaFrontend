// src/features/finance/FinanceDashboard.jsx (Refactored)

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FinanceStatsGrid } from './components/FinanceStatsGrid';
import { FinanceToolBar } from './components/FinanceToolBar';
import { TransactionList } from './components/TransactionList';
import DataPreviewModal from '../../components/shared/DataPreviewModal';
import { api } from '@/lib/api';
// Import the new Service Layer
import { 
    getFinanceTransactions, 
    getTransactionDetails, 
    updateTransactionStatus, 
    calculateCommission,
    calculatePreview 
} from './financeService';

export default function FinanceDashboard({ onLogout }) {
    // --- ALL STATE REMAINS HERE ---
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const datePickerRef = useRef(null);
    const [apiError, setApiError] = useState(null); // <-- Error state remains
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [liveEdits, setLiveEdits] = useState(null); 
    const [liveKpis, setLiveKpis] = useState(null);
    const [editedFixedCosts, setEditedFixedCosts] = useState(null);

    // --- DATA FETCHING (CLEANED UP) ---
    const fetchTransactions = async () => {
        setIsLoading(true);
        setApiError(null);
        
        // Use the service function
        const result = await getFinanceTransactions(currentPage); 
        
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

    // --- CALCULATIONS (REMAINS THE SAME) ---
    const stats = useMemo(() => {
        // ... (your stats calculation logic)
        const totalApprovedValue = transactions
            .filter(t => t.status === 'APPROVED')
            .reduce((acc, t) => acc + (t.totalValue || 100000), 0); // Placeholder
        const averageMargin = transactions.length > 0
            ? transactions.reduce((acc, t) => acc + t.grossMarginRatio, 0) / transactions.length
            : 0;
        const highRiskDeals = transactions.filter(t => t.payback > 36).length;
        const dealsThisMonth = transactions.filter(t => {
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

    const filteredTransactions = useMemo(() => {
        // ... (your filter calculation logic)
        return transactions.filter(t => {
            const clientMatch = t.clientName.toLowerCase().includes(filter.toLowerCase());
            if (!selectedDate) return clientMatch;
            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);

    // --- EVENT HANDLERS (UPDATED) ---
    const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
    const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };

    const handleRowClick = async (transaction) => {
        setApiError(null);
        // Reset all live states to ensure a clean modal
        setLiveEdits(null);
        setLiveKpis(null);
        setEditedFixedCosts(null); 
        
        const result = await getTransactionDetails(transaction.id);
        
        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) {
            setSelectedTransaction(result.data);
            // NEW: Initialize the editable fixed costs state from the full data payload
            setEditedFixedCosts(result.data.fixed_costs || []); 
            setIsDetailModalOpen(true);
        } else {
            setApiError(result.error);
        }
    };

    const handleFixedCostChange = (index, field, value) => {
        // Guard against race conditions
        if (!editedFixedCosts) return;

        // Create a new array with the updated item
        const newCosts = [...editedFixedCosts]; 
        newCosts[index] = { 
            ...newCosts[index], 
            [field]: value 
        };
        
        // 1. Set the new array to state
        setEditedFixedCosts(newCosts); 
        
        // 2. Trigger recalculation, passing a special key and the *new* costs array
        handleRecalculate('fixed_costs', newCosts);
    };

    const handleRecalculate = async (key, value) => {
        if (!selectedTransaction) return;

        setApiError(null);
        
        // 1. Update the local liveEdits state for all non-cost changes
        if (key !== 'fixed_costs') {
            setLiveEdits(prev => ({ ...prev, [key]: value }));
        }

        // 2. Prepare the payload
        const baseTransaction = selectedTransaction.transactions;
        
        // Get the *most current* edits, including the one that just happened
        const currentEdits = { ...liveEdits, [key]: value }; 

        // 3. Determine the *correct* fixed_costs array to send
        let costsForPayload;
        if (key === 'fixed_costs') {
            costsForPayload = value; // The new array was passed in directly from handleFixedCostChange
        } else {
            costsForPayload = editedFixedCosts; // Use the existing state for other changes
        }

        // 4. Map keys to the backend 'transactions' payload
        const payloadUpdates = {
             unidadNegocio: currentEdits.unidadNegocio ?? baseTransaction.unidadNegocio,
             gigalan_region: currentEdits.gigalan_region ?? baseTransaction.gigalan_region,
             gigalan_sale_type: currentEdits.gigalan_sale_type ?? baseTransaction.gigalan_sale_type,
             gigalan_old_mrc: currentEdits.gigalan_old_mrc ?? baseTransaction.gigalan_old_mrc,
             plazoContrato: currentEdits.plazoContrato ?? baseTransaction.plazoContrato,
             MRC: currentEdits.MRC ?? baseTransaction.MRC,
             NRC: currentEdits.NRC ?? baseTransaction.NRC,
        };
        
        // 5. Build the *full* recalculation payload
        const recalculationPayload = {
            ...selectedTransaction,     // Includes original recurring_services
            fixed_costs: costsForPayload, // The new/current fixed costs array
            transactions: {
                ...baseTransaction,
                ...payloadUpdates
            }
        };

        // Clean up response-only keys before sending
        delete recalculationPayload.timeline;

        // 6. Call the service
        try {
            const result = await calculatePreview(recalculationPayload); 

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


    // Overwrite handleApprove/Reject to include latest edits in submission
    const handleUpdateStatus = async (transactionId, status) => {
        setApiError(null);
        
        // 1. Prepare 'transactions' object payload
        const modifiedFields = {
            ...selectedTransaction.transactions,
            ...liveEdits,
        };
        
        // 2. Call the service.
        // The service function (as modified in Step 5) now takes
        // 'editedFixedCosts' as its 4th argument.
        const result = await updateTransactionStatus(
            transactionId, 
            status, 
            modifiedFields, 
            editedFixedCosts 
        );
        
        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) {
            setIsDetailModalOpen(false);
            // Reset all live states
            setLiveEdits(null); 
            setLiveKpis(null); 
            setEditedFixedCosts(null); 
            fetchTransactions(); // Refresh the main list
        } else {
            setApiError(result.error);
        }
    };

    const handleCalculateCommission = async (transactionId) => {
        setApiError(null);
        // Use the service function
        const result = await calculateCommission(transactionId);
        
        if (result.status === 401) {
            onLogout();
            return;
        }

        if (result.success) { 
            // If recalculation is successful, update the detail modal data and refresh the list
            setSelectedTransaction(result.data); 
            fetchTransactions(); 
        } else {
             // CRITICAL CHANGE: Catch the error from the service and display it.
             setApiError(result.error);
        }
    };

    const handleApprove = (transactionId) => { handleUpdateStatus(transactionId, 'approve'); };
    const handleReject = (transactionId) => { handleUpdateStatus(transactionId, 'reject'); };

    // --- CLEAN RENDER METHOD (REMAINS THE SAME) ---
    return (
        <>
            <div className="container mx-auto px-8 py-8">    
            {/* 1. Render the Stats Grid Component */}
            <FinanceStatsGrid stats={stats} />
    
            {/* This white box contains the toolbar and the table */}
            <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
                {/* 2. Render the Toolbar Component */}
                <FinanceToolBar
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
                
                {/* 3. Render the Table List Component */}
                <TransactionList
                    isLoading={isLoading}
                    transactions={filteredTransactions}
                    onRowClick={handleRowClick}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage} // Pass the setter function
                />
            </div>
            </div>
            
            {/* Modals and Toasts stay here, controlled by the parent */}
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            
            <DataPreviewModal 
                isOpen={isDetailModalOpen} 
                onClose={() => { setIsDetailModalOpen(false); setLiveEdits(null); setLiveKpis(null); }} 
                data={selectedTransaction} 
                isFinanceView={true}
                onApprove={handleApprove}
                onReject={handleReject}
                onCalculateCommission={handleCalculateCommission}
            
                liveKpis={liveKpis} 
                gigalanInputs={liveEdits} // Pass liveEdits for Gigalan fields (region, type, old_mrc)
                onGigalanInputChange={handleRecalculate} // Central handler for all KPI/Gigalan/Plazo edits
                selectedUnidad={liveEdits?.unidadNegocio}
                onUnidadChange={(value) => handleRecalculate('unidadNegocio', value)} // Central handler for Unidad edit
                fixedCostsData={editedFixedCosts} // Pass the editable state
                onFixedCostChange={handleFixedCostChange} // Pass the new handle
            />
        </>
    );
}