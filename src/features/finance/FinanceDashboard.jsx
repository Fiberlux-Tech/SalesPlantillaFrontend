import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FinanceStatsGrid } from './components/FinanceStatsGrid';
import { FinanceToolBar } from './components/FinanceToolBar';
import { TransactionList } from './components/TransactionList';
import DataPreviewModal from '../../components/shared/DataPreviewModal';

export default function FinanceDashboard({ onLogout }) {
    // --- ALL STATE REMAINS HERE ---
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const datePickerRef = useRef(null);
    const [apiError, setApiError] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    // --- ALL DATA FETCHING REMAINS HERE ---
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
                // ... (formatting logic is fine here)
                const formattedTransactions = result.data.transactions.map(tx => ({
                    id: tx.id,
                    unidadNegocio: tx.unidadNegocio,
                    clientName: tx.clientName,
                    salesman: tx.salesman,
                    MRC: tx.MRC,
                    plazoContrato: tx.plazoContrato,
                    grossMarginRatio: tx.grossMarginRatio,
                    payback: tx.payback,
                    submissionDate: new Date(tx.submissionDate).toISOString().split('T')[0],
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

    // --- ALL CALCULATIONS REMAIN HERE ---
    const stats = useMemo(() => {
        // ... (your stats calculation)
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
            totalApprovedValue: `$${(totalApprovedValue / 1000000).toFixed(2)}M`,
            averageMargin: `${(averageMargin * 100).toFixed(2)}%`,
            highRiskDeals,
            dealsThisMonth,
        };
    }, [transactions]);

    const filteredTransactions = useMemo(() => {
        // ... (your filter calculation)
        return transactions.filter(t => {
            const clientMatch = t.clientName.toLowerCase().includes(filter.toLowerCase());
            if (!selectedDate) return clientMatch;
            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);

    // --- ALL EVENT HANDLERS & HOOKS REMAIN HERE ---
    useEffect(() => {
        function handleClickOutside(event) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
                setIsDatePickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [datePickerRef]);

    const handleClearDate = () => { setSelectedDate(null); setIsDatePickerOpen(false); };
    const handleSelectToday = () => { setSelectedDate(new Date()); setIsDatePickerOpen(false); };

    const handleRowClick = async (transaction) => {
        // ... (your row click logic)
        try {
            const response = await fetch(`/api/transaction/${transaction.id}`);
            if (response.status === 401) {
                onLogout();
                return;
            }
            const result = await response.json();
            if (result.success) {
                setSelectedTransaction(result.data);
                setIsDetailModalOpen(true);
            } else {
                setApiError(result.error || 'Failed to fetch transaction details.');
            }
        } catch (error) {
            setApiError('Failed to connect to the server.');
        }
    };

    const handleUpdateStatus = async (transactionId, status) => {
        // ... (your update status logic)
        const endpoint = status === 'approve' ? 'approve' : 'reject';
        try {
            const response = await fetch(`/api/transaction/${endpoint}/${transactionId}`, {
                method: 'POST',
            });
            if (response.status === 401) {
                onLogout();
                return;
            }
            const result = await response.json();
            if (result.success) {
                setIsDetailModalOpen(false);
                fetchTransactions(); // Refresh the table
            } else {
                setApiError(result.error || `Failed to ${status} transaction.`);
            }
        } catch (error) {
            setApiError('Failed to connect to the server.');
        }
    };

    const handleApprove = (transactionId) => { handleUpdateStatus(transactionId, 'approve'); };
    const handleReject = (transactionId) => { handleUpdateStatus(transactionId, 'reject'); };

    // --- CLEAN RENDER METHOD ---
    return (
        <>
            <div className="container mx-auto px-8 py-8">
            {/* Header stays here as it's simple */}
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Finance Dashboard</h1>
                    <p className="text-gray-500 mt-1">Review and analyze deal proposals</p>
                </div>
            </header>
    
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
                onClose={() => setIsDetailModalOpen(false)} 
                data={selectedTransaction} 
                isFinanceView={true}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </>
    );
}