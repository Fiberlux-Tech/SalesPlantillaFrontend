import React, { useState, useMemo, useEffect, useRef } from 'react';

// --- Component Imports ---
import StatsCard from './components/StatsCard';
import StatusBadge from './components/StatusBadge';
import DataPreviewModal from './components/DataPreviewModal';
import DatePicker from './components/DatePicker';

// --- Icon Imports ---
import {
    ClockIcon,
    TrendUpIcon,
    DollarSignIcon,
    FileTextIcon,
    SearchIcon,
    CalendarIcon
} from './components/Icons';

// --- Main App Component ---

export default function FinanceDashboard() {
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('');
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const datePickerRef = useRef(null);
    const [apiError, setApiError] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // --- Pagination State ---
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/transactions?page=${currentPage}&per_page=30`);
            const result = await response.json();
            if (result.success) {
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

    // --- Fetch Transactions from the Backend ---
    useEffect(() => {
        fetchTransactions();
    }, [currentPage]);

    // --- Stats Cards - UPDATED FOR FINANCE ---
    const stats = useMemo(() => {
        // Placeholder metrics for the Finance Dashboard
        const totalApprovedValue = transactions
            .filter(t => t.status === 'APPROVED')
            .reduce((acc, t) => acc + (t.totalValue || 100000), 0); // Placeholder value
        const averageMargin = transactions.length > 0
            ? transactions.reduce((acc, t) => acc + t.grossMarginRatio, 0) / transactions.length
            : 0;
        const highRiskDeals = transactions.filter(t => t.payback > 36).length; // Example metric
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
        return transactions.filter(t => {
            const clientMatch = t.clientName.toLowerCase().includes(filter.toLowerCase());
            if (!selectedDate) return clientMatch;
            const transactionDate = new Date(t.submissionDate + 'T00:00:00');
            return clientMatch && transactionDate.toDateString() === selectedDate.toDateString();
        });
    }, [transactions, filter, selectedDate]);

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
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/transaction/${transaction.id}`);
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
        const endpoint = status === 'approve' ? 'approve' : 'reject';
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/transaction/${endpoint}/${transactionId}`, {
                method: 'POST',
            });
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

    const handleApprove = (transactionId) => {
        handleUpdateStatus(transactionId, 'approve');
    };

    const handleReject = (transactionId) => {
        handleUpdateStatus(transactionId, 'reject');
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <div className="container mx-auto p-8">

                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Finance Dashboard</h1>
                        <p className="text-gray-500 mt-1">Review and analyze deal proposals</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard title="Total Approved Value" value={stats.totalApprovedValue} icon={<DollarSignIcon />} iconBgColor="bg-green-100" />
                    <StatsCard title="Average Margin" value={stats.averageMargin} icon={<TrendUpIcon />} iconBgColor="bg-blue-100" />
                    <StatsCard title="High-Risk Deals" value={stats.highRiskDeals} icon={<FileTextIcon />} iconBgColor="bg-yellow-100" />
                    <StatsCard title="Deals This Month" value={stats.dealsThisMonth} icon={<ClockIcon />} iconBgColor="bg-purple-100" />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-full max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                            <input type="text" placeholder="Filter by client name..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={filter} onChange={(e) => setFilter(e.target.value)} />
                        </div>
                        <div className="relative w-full max-w-xs" ref={datePickerRef}>
                            <button onClick={() => setIsDatePickerOpen(!isDatePickerOpen)} className="w-full flex justify-between items-center text-left px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                <span className={selectedDate ? 'text-gray-800' : 'text-gray-400'}>{selectedDate ? selectedDate.toLocaleDateString('en-CA') : 'dd/mm/yyyy'}</span>
                                <CalendarIcon />
                            </button>
                            {isDatePickerOpen && <DatePicker selectedDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); setIsDatePickerOpen(false); }} onClear={handleClearDate} onSelectToday={handleSelectToday} />}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-center">Transaction ID</th>
                                    <th scope="col" className="px-6 py-3 text-center">Business Unit</th>
                                    <th scope="col" className="px-6 py-3 text-center">Client</th>
                                    <th scope="col" className="px-6 py-3 text-center">Salesman</th>
                                    <th scope="col" className="px-6 py-3 text-center">MRC</th>
                                    <th scope="col" className="px-6 py-3 text-center">Contract Term</th>
                                    <th scope="col" className="px-6 py-3 text-center">Margin %</th>
                                    <th scope="col" className="px-6 py-3 text-center">Payback (Months)</th>
                                    <th scope="col" className="px-6 py-3 text-center">Submission Date</th>
                                    <th scope="col" className="px-6 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr><td colSpan="10" className="text-center py-4">Loading transactions...</td></tr>
                                ) : (
                                    filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(tx)}>
                                            <td className="px-6 py-4 font-medium text-gray-900 text-center">{tx.id}</td>
                                            <td className="px-6 py-4 text-center">{tx.unidadNegocio}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900 text-center">{tx.clientName}</td>
                                            <td className="px-6 py-4 text-center">{tx.salesman}</td>
                                            <td className="px-6 py-4 text-center">${tx.MRC.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">{tx.plazoContrato}</td>
                                            <td className="px-6 py-4 font-medium text-blue-600 text-center">{`${(tx.grossMarginRatio * 100).toFixed(2)}%`}</td>
                                            <td className="px-6 py-4 text-center">{tx.payback}</td>
                                            <td className="px-6 py-4 text-center">{tx.submissionDate}</td>
                                            <td className="px-6 py-4 text-center"><StatusBadge status={tx.status} /></td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* --- Pagination Controls --- */}
                    <div className="flex justify-between items-center pt-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            {apiError && <div className="fixed top-5 right-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{apiError}</span></div>}
            
            <DataPreviewModal 
                isOpen={isDetailModalOpen} 
                onClose={() => setIsDetailModalOpen(false)} 
                data={selectedTransaction} 
                isFinanceView={true}
                onApprove={handleApprove}
                onReject={handleReject}
            />
        </div>
    );
}