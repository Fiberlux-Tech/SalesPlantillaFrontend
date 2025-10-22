import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SalesStatsGrid } from './components/SalesStatsGrid';
import { SalesToolbar } from './components/SalesToolBar';
import { SalesTransactionList } from './components/SalesTransactionList';
import FileUploadModal from './components/FileUploadModal';
import DataPreviewModal from '../../components/shared/DataPreviewModal';
import { UploadIcon, ExportIcon } from '../../components/shared/Icons';

// Note: StatsCard, StatusBadge, DataPreviewModal are imported from 
// the global components folder, which is correct.

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

    // --- ALL DATA FETCHING & LOGIC REMAINS HERE ---
    const fetchTransactions = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await fetch(`/api/transactions?page=${currentPage}&per_page=30`);
            if (response.status === 401) {
                onLogout(); 
                return;
            }
            const result = await response.json();
            if (result.success) {
                // ... formatting logic
                const formattedTransactions = result.data.transactions.map(tx => ({
                    id: tx.id,
                    client: tx.clientName,
                    salesman: tx.salesman,
                    grossMarginRatio: tx.grossMarginRatio,
                    payback: tx.payback,
                    submissionDate: new Date(tx.submissionDate).toISOString().split('T')[0],
                    approvalDate: tx.approvalDate ? new Date(tx.approvalDate).toISOString().split('T')[0] : 'N/A',
                    status: tx.ApprovalStatus,
                }));
                setTransactions(formattedTransactions);
                setTotalPages(result.data.pages);
            } else {
                setApiError(result.error || 'Failed to fetch transactions.');
            }
        } catch (error) {
            setApiError('Failed to connect to the server. Please ensure the backend is running.');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

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

    useEffect(() => {
        // ... your click-outside logic
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsDatePickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [datePickerRef]);

    // --- ALL HANDLERS REMAIN HERE ---
    const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
    const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };

    const handleGigalanInputChange = (key, value) => {
        setGigalanCommissionInputs(prev => {
            const newState = { ...prev, [key]: value };
            // CRITICAL: Clear old_mrc if sale type changes to NEW
            if (key === 'gigalan_sale_type' && value !== 'EXISTING') {
                newState.gigalan_old_mrc = null;
            }
            return newState;
        });
    };

    const handleUploadNext = async (file) => {
        // ... your upload logic
        if (!file) return;
        setApiError(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/process-excel', {
                method: 'POST',
                body: formData,
            });
            if (response.status === 401) {
                onLogout();
                return;
            }
            const result = await response.json();
            if (result.success) {
                const dataWithFilename = { ...result.data, fileName: file.name };
                setUploadedData(dataWithFilename);
                setIsModalOpen(false);
                setIsPreviewModalOpen(true);
                setGigalanCommissionInputs({
                    gigalan_region: '',
                    gigalan_sale_type: '',
                    gigalan_old_mrc: null,
                });
            } else {
                setApiError(result.error || 'An unknown error occurred.');
                setIsModalOpen(false);
            }
        } catch (error) {
            setApiError('Failed to connect to the server. Please ensure the backend is running.');
            setIsModalOpen(false);
        }
    };

    const handleConfirmSubmission = async () => {
        // ... your confirm logic
        if (!uploadedData) return;
        setApiError(null);
        // <--- VALIDATION: Check for GIGALAN requirements before submission (New Logic) --->
        if (uploadedData.transactions.unidadNegocio === 'GIGALAN') {
            if (!gigalanCommissionInputs.gigalan_region || !gigalanCommissionInputs.gigalan_sale_type) {
                setApiError('GIGALAN transactions require Region and Type of Sale to be selected.');
                return;
            }
            if (gigalanCommissionInputs.gigalan_sale_type === 'EXISTING' && (!gigalanCommissionInputs.gigalan_old_mrc || gigalanCommissionInputs.gigalan_old_mrc <= 0)) {
                setApiError('GIGALAN Existing Sales require a valid Previous Monthly Charge amount.');
                return;
            }
        }
        
        // <--- PREPARE FINAL PAYLOAD (New Logic) --->
        const finalPayload = {
            ...uploadedData,
            transactions: {
                ...uploadedData.transactions,
                // Merge GIGALAN inputs into the main transaction object
                ...gigalanCommissionInputs, 
            }
        };
        try {
            const response = await fetch('/api/submit-transaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalPayload),
            });
            if (response.status === 401) {
                onLogout();
                return;
            }
            const result = await response.json();
            if (result.success) {
                fetchTransactions(); 
                setIsPreviewModalOpen(false);
                setUploadedData(null);
            } else {
                setApiError(result.error || 'An unknown error occurred.');
            }
        } catch (error) {
            setApiError('Failed to connect to the server. Please ensure the backend is running.');
        }
    };

    // --- CLEAN RENDER METHOD ---
    return (
        <>
            <div className="container mx-auto px-8 py-8">
            {/* The header is simple, so it can stay */}
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
            <DataPreviewModal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} onConfirm={handleConfirmSubmission} data={uploadedData} gigalanInputs={gigalanCommissionInputs} onGigalanInputChange={handleGigalanInputChange} />
        </>
    );
}